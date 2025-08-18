// ======================================================================
// src/js/app.js  (clean ASCII version)
// ======================================================================

// BLOCK 1 — IMPORTS
import { EventBus } from './modules/system/event_bus.js';
import { renderLibrary } from './modules/visual/Library.js';
import Inspector from './modules/ui/inspector/inspector.js';
import View3D from './modules/viewport3d/engine.js';              // optionnel : fonctionne même sans canvas
import { attachContextMenu } from './modules/visual/context.js';   // optionnel : ok si absent
import { setContext } from './modules/context.js';

// BLOCK 2 — HELPERS
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// BLOCK 3 — ensureGraph (safe)
async function ensureGraph() {
  if (window.graph) return window.graph;

  // Récupération de toutes les zones nécessaires au module de graph
  // - area : conteneur principal
  // - viewport : zone où les nœuds sont placés
  // - wireSvg : calque SVG pour les câbles
  // - libContainer/zoomLabel/nameInput/... : éléments d'interface optionnels
  const area = $('#node-area') || $('[data-role="vs-area"]');
  if (!area) return null;
  const viewport     = area.querySelector('#viewport');
  const wireSvg      = area.querySelector('#wires');
  const libContainer = $('#node-library');
  const zoomLabel    = $('#zoom-label');
  const nameInput    = $('#vs-name');
  const assignSelect = $('#vs-assign');
  const scriptList   = $('#script-list');

  try {
    const mod = await import('./modules/visual/graph.js');
    if (typeof mod.createGraph === 'function') {
      // Initialisation du graph avec toutes les références DOM
      window.graph = mod.createGraph({ area, viewport, wireSvg, libContainer, zoomLabel, nameInput, assignSelect, scriptList });
      return window.graph;
    }
  } catch (e) {
    console.warn('[app] graph.js import skipped:', e && e.message ? e.message : e);
  }
  return window.graph || null;
}

// BLOCK 4 — initLibrary (with create and drag support)
async function initLibrary() {
  const el = $('[data-role="node-library"], #node-library, .node-library');
  if (!el) return;

  const onCreate = async (type) => {
    const g = await ensureGraph();
    if (!g || typeof g.createNode !== 'function') return;
    // Demande au graph de créer un nœud du type choisi
    const node = g.createNode(type);
    // Le DOM du nœud est renvoyé pour que l'on puisse, par exemple, le rendre visible
    if (node && node.view) node.view.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  await renderLibrary(el, { onCreate });
}

// BLOCK 5 — initInspectorUI
function initInspectorUI(active = 'visual_scripting') {
  const insp = $('[data-role="inspector"]');
  if (!insp) return;
  Inspector.initInspector(insp);
  setContext(active);
}

// BLOCK 6 — initNodeAreaDnD (Library -> Visual Scripting)
function initNodeAreaDnD() {
  const area = $('#node-area') || $('[data-role="vs-area"]');
  if (!area) return;

  area.addEventListener('dragover', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    if (dt.types && (dt.types.includes('text/node-type') || dt.types.includes('text/plain'))) {
      e.preventDefault();
    }
  });

  area.addEventListener('drop', async (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    const type = dt.getData('text/node-type') || dt.getData('text/plain');
    if (!type) return;
    e.preventDefault();

    const g = await ensureGraph();
    if (!g || typeof g.createNode !== 'function') return;

    // Position du drop convertie dans le repère du graph
    const rect = area.getBoundingClientRect();
    const scale = typeof g.getScale === 'function' ? (g.getScale() || 1) : 1;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top)  / scale;

    // On délègue la création du nœud au graph qui se charge aussi
    // de l'ajouter à la bonne position
    g.createNode(type, x, y);
    if (typeof g.redrawWires === 'function') g.redrawWires();
  });
}

// BLOCK 7 — initContextMenu (right click)
function initContextMenu() {
  const area = $('#node-area') || $('[data-role="vs-area"]');
  if (!area || !window.graph) return;
  try { attachContextMenu(area, window.graph); } catch (_) {}
}

// BLOCK 8 — initTabs (IDE tabs)
function initTabs() {
  const sections = $$('.ide-tab')
    .map((btn) => {
      const tgt = btn.getAttribute('data-target');
      if (!tgt) return null;
      const key = tgt.replace(/^tab-/, '');
      const el = document.getElementById('tab-' + key);
      return el ? { key, el } : null;
    })
    .filter(Boolean);

  function show(key) {
    sections.forEach(({ key: k, el }) => el.classList.toggle('hidden', k !== key));
    const map = { visual: 'visual_scripting', code: 'code', viewport: 'viewport_3d' };
    setContext(map[key] || 'visual_scripting');

    if (key === 'viewport') {
      const canvas = $('[data-role="viewport3d-canvas"]');
      if (canvas && View3D && typeof View3D.initViewport3D === 'function' && !canvas._vs3dInit) {
        try { View3D.initViewport3D(canvas); canvas._vs3dInit = true; } catch (e) { console.error('[app] viewport3D init:', e); }
      }
    }
  }

  $$('.ide-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tgt = btn.getAttribute('data-target'); // e.g. "tab-visual"
      if (!tgt) return;
      const key = tgt.replace(/^tab-/, '');
      show(key);
      $$('.ide-tab').forEach((b) => b.classList.remove('bg-white/10'));
      btn.classList.add('bg-white/10');
    });
  });

  // default tab
  show('visual');
  const first = $('.ide-tab[data-target="tab-visual"]');
  if (first) first.classList.add('bg-white/10');
}

// BLOCK 9 — initUI + DOM ready
async function initUI() {
  await ensureGraph();
  await initLibrary();
  initInspectorUI('visual_scripting');
  initNodeAreaDnD();
  initContextMenu();
  initTabs();
  EventBus.on('context.changed', ctx => console.log('[app] context:', ctx));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI, { once: true });
} else {
  initUI();
}
