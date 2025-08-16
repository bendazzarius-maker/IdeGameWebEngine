// Outliner affichant la hiérarchie d'objets ou de nodes

import { EventBus } from '../system/event_bus.js';
import { list, removeObject, renameObject } from '../scene/scene.js';
import { getContext, onContextChanged } from '../context.js';
import * as GameProps from '../data/game_properties.js';

let root;
let selectedId = null;

export function initOutliner(el){
  root = el || document.getElementById('outliner');
  if(!root) return;
  EventBus.on('sceneUpdated', render);
  EventBus.on('objectSelected', id=>{ selectedId=id; render(); });
  EventBus.on('gamePropChanged', render);
  EventBus.on('gamePropRemoved', render);
  EventBus.on('gamePropRenamed', render);
  onContextChanged(render);
  render();
}

function render(){
  if(!root) return;
  root.innerHTML = '';
  const ctx = getContext();
  if(ctx === 'visual_scripting') renderLogic();
  else renderScene();
}

function renderScene(){
  list().forEach(obj=>{
    const row = document.createElement('div');
    row.className = 'px-2 py-1 flex items-center gap-2 hover:bg-slate-700 cursor-pointer';
    if(obj.id === selectedId) row.classList.add('bg-slate-700');

    const name = document.createElement('span');
    name.textContent = obj.name;
    row.appendChild(name);

    const count = GameProps.list(obj.id).length;
    if(count>0){
      const badge = document.createElement('span');
      badge.textContent = count;
      badge.className = 'text-[10px] px-1 rounded bg-slate-600 ml-1';
      row.appendChild(badge);
    }

    row.onclick = () => { selectedId = obj.id; EventBus.emit('objectSelected', obj.id); render(); };
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
