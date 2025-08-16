// Outliner minimal affichant les objets de la scène

import { EventBus } from '../system/event_bus.js';
import { getSceneSnapshot } from '../scene/scene.js';

let root;
let selectedId = null;

// Initialise l'outliner et abonne les événements
export function initOutliner(el){
  root = el;
  if(!root) return;
  EventBus.on('sceneUpdated', render);
  EventBus.on('objectSelected', data=>{ selectedId = typeof data === 'object' ? data.id : data; render(); });
  render();
}

// Re-dessine la liste d'objets
function render(){
  if(!root) return;
  root.innerHTML = '';
  getSceneSnapshot().forEach(obj=>{
    const row = document.createElement('div');
    row.className = 'px-2 py-1 hover:bg-slate-700 cursor-pointer';
    if(obj.id === selectedId) row.classList.add('bg-slate-700');
    row.textContent = obj.name;
    row.onclick = () => {
      selectedId = obj.id;
      EventBus.emit('objectSelected', { id: obj.id });
      render();
    };
    root.appendChild(row);
  });
}

export default { initOutliner };

