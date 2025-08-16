// Outliner affichant la hiérarchie d'objets ou de nodes

import { EventBus } from '../system/event_bus.js';
import { list, removeObject, renameObject } from '../scene/scene.js';
import { getContexte } from '../system/context.js';

let root;

export function initOutliner(el){
  root = el || document.getElementById('outliner');
  if(!root) return;
  EventBus.on('sceneUpdated', render);
  EventBus.on('contextChanged', render);
  render();
}

function render(){
  if(!root) return;
  root.innerHTML = '';
  const ctx = getContexte();
  if(ctx === 'viewport') renderScene();
  else if(ctx === 'visual_scripting') renderLogic();
}

function renderScene(){
  list().forEach(obj=>{
    const row = document.createElement('div');
    row.className = 'px-2 py-1 flex items-center gap-2 hover:bg-slate-700 cursor-pointer';
    row.textContent = obj.name;
    row.onclick = () => EventBus.emit('objectSelected', obj.id);
    row.ondblclick = () => editName(row, obj);
    const del = document.createElement('button');
    del.textContent = '×';
    del.className = 'ml-auto text-red-400';
    del.onclick = (e)=>{ e.stopPropagation(); removeObject(obj.id); };
    row.appendChild(del);
    root.appendChild(row);
  });
}

function editName(row, obj){
  const input = document.createElement('input');
  input.value = obj.name; input.className='bg-slate-700 text-xs px-1';
  row.textContent=''; row.appendChild(input); input.focus();
  input.onblur = () => { renameObject(obj.id, input.value); };
  input.onkeydown = e=>{ if(e.key==='Enter') input.blur(); };
}

function renderLogic(){
  const info = document.createElement('div');
  info.className = 'p-2 text-xs text-slate-400';
  info.textContent = 'Groupes de nodes (visual scripting)';
  root.appendChild(info);
}

export default { initOutliner };
