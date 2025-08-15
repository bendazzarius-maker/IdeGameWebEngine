// 📁 src/js/boot/visual_boot.js  (optionnel, non destructif)
// Monte l'UI de test sans toucher à ton app.js existant.
import { registerCatalog } from '../modules/visual/catalog.js';
import { Graph, createById } from '../modules/graph/Graph.js';
import { renderNode } from '../modules/visual/render/NodeRenderer.js';

function ensureContainer() {
  let el = document.getElementById('visual-editor');
  if (!el) { el = document.createElement('div'); el.id='visual-editor'; document.body.appendChild(el); }
  el.style.display = 'grid';
  el.style.gridTemplateColumns = 'repeat(2, minmax(320px, 1fr))';
  el.style.gap = '12px';
  el.style.padding = '12px';
  return el;
}

window.addEventListener('DOMContentLoaded', () => {
  registerCatalog();
  const graph = new Graph();
  const root = ensureContainer();
  // Démo: tu peux remplacer par les IDs exacts de classes UPBGE
  const demoIds = ['LogicNodeGetObject','LogicNodeRaycast'];
  demoIds.forEach(id => {
    try {
      const node = createById(graph, id);
      renderNode(root, node, graph);
    } catch(e) { console.warn('Node not found:', id); }
  });
});