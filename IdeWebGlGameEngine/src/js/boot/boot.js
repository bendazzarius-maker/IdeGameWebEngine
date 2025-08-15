/* ===== BLOCK 1 — IMPORTS ===== */
import { $, $$, log, makeVSplit, makeHSplit } from '../core/dom.js';
import { Project } from '../core/project.js';
import { createGraph } from '../modules/visual/graph.js';
import '../modules/visual/enhance.js'; // patches Graph: sélection rectangulaire + frames
import { NodeCatalog, portColor } from '../modules/visual/catalog.js';
import { initContextMenu } from '../modules/visual/context.js';
import { initInspector } from '../modules/inspector/inspector.js'; // <-- chemin corrigé


/* ===== BLOCK 2 — HELPERS ===== */
function activateTab(id){
  const panels = ['tab-visual','tab-code','tab-viewport','tab-shader','tab-audio','tab-animation','tab-video']
    .map(i=>({ id:i, el:$('#'+i)}));
  panels.forEach(p=>{
    const a = (p.id===id);
    if (p.el){
      p.el.classList.toggle('hidden', !a);
      p.el.dataset.active = a ? 'true' : 'false';
    }
  });
  $$('.ide-tab').forEach(b=> b.dataset.active = (b.dataset.target===id ? 'true' : 'false'));

  // Signaler le changement d’onglet (l’inspector a aussi un MO, mais ça aide au debug)
  window.dispatchEvent(new CustomEvent('ide:tabchanged', { detail:{ id } }));
}
function bindTabs(){
  $$('.ide-tab').forEach(b=> b.addEventListener('click', ()=> activateTab(b.dataset.target)));
}

/* ===== BLOCK 3 — INIT APP ===== */
function init(){
  // Splitters
  makeVSplit($('#div-left'),  $('#left-pane'),  $('#center-pane'));
  makeVSplit($('#div-right'), $('#center-pane'), $('#right-pane'));
  makeHSplit($('#div-bottom'), $('#app'), $('#bottom-pane'));

  // Graph
  const graph = createGraph({
    area: $('#node-area'),
    viewport: $('#viewport'),
    wireSvg: $('#wires'),
    libContainer: $('#node-library'),
    zoomLabel: $('#zoom-label'),
    nameInput: $('#vs-name'),
    assignSelect: $('#vs-assign'),
    scriptList: $('#script-list')
  });
  graph.buildLibrary();
  graph.refreshAssignOptions();
  graph.setNameAssign(Project.current.name, Project.current.assignedTo);

  // Menu contextuel IDE (clic droit)
  initContextMenu({
    appRoot: $('#app'),
    menuEl: $('#ide-context'),
    VS: graph.VS,
    selectNode: graph.selectNode,
    removeNode: graph.removeNode,
    duplicateNode: graph.duplicateNode,
    centerOnNode: graph.centerOnNode,
    cutAllEdgesOf: graph.cutAllEdgesOf,
    setViewportTransform: graph.setViewportTransform
  });

  // Amorçage : quelques nœuds + 2 liaisons valides
  const inputGroup = NodeCatalog.find(g=>g.group==='Input');
  const vectorGroup= NodeCatalog.find(g=>g.group==='Vector');
  const eventGroup = NodeCatalog.find(g=>g.group==='Event');
  const actGroup   = NodeCatalog.find(g=>g.group==='Actuator');
  if (inputGroup && vectorGroup && eventGroup && actGroup){
    con
function initUI() {
  // Library
  const libEl = document.querySelector('[data-role="node-library"]');
  if (libEl) {
    const onCreate = (type) => {
      // crée le node si le graphe est prêt (ne plante pas si absent)
      if (window.graph?.createNode) window.graph.createNode(type);
    };
    renderLibrary(libEl, { onCreate });
  }

  // Inspecteur
  const inspEl = document.querySelector('[data-role="inspector"]');
  if (inspEl) {
    Inspector.initInspector(inspEl);
    // choisis l’onglet actif selon ta barre d’onglets
    Inspector.switchInspector('visual');
  }

  // Viewport 3D
  const canvas3d = document.querySelector('[data-role="viewport3d-canvas"]');
  if (canvas3d && View3D?.initViewport3D) {
    View3D.initViewport3D(canvas3d);
  }
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI, { once: true });
} else {
  initUI();
}
