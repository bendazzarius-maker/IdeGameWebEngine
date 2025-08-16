// Sous-module d'inspector pour le contexte viewport

import { EventBus } from '../../system/event_bus.js';
import { getObject } from '../../scene/scene.js';
import * as GameProps from '../../data/game_properties.js';

let currentId = null;
EventBus.on('objectSelected', id=>{ currentId = id; });

export function render(el){
  const id = currentId;
  if(!id){ el.textContent = 'Aucun objet sélectionné'; return; }
  const obj = getObject(id);
  if(!obj){ el.textContent = 'Objet introuvable'; return; }

  el.appendChild(makeVec3('Position', obj.position));
  el.appendChild(makeVec3('Rotation', obj.rotation));
  el.appendChild(makeVec3('Échelle', obj.scale));

  const gpTitle = document.createElement('h4');
  gpTitle.textContent = 'Game Properties'; gpTitle.className='mt-4 mb-2 text-xs text-slate-400';
  el.appendChild(gpTitle);
  renderGameProps(el, id);
}

function makeVec3(label, vec){
  const wrap = document.createElement('div');
  const lab = document.createElement('div'); lab.textContent = label; lab.className='text-xs text-slate-400';
  const row = document.createElement('div');
  ['x','y','z'].forEach(a=>{
    const inp = document.createElement('input');
    inp.type='number'; inp.value = vec[a];
    inp.className='w-16 bg-slate-700 text-xs mr-1 px-1';
    inp.onchange = ()=>{ vec[a] = parseFloat(inp.value); EventBus.emit('sceneUpdated', { type:'transform', id: currentId }); };
    row.appendChild(inp);
  });
  wrap.append(lab,row); return wrap;
}

function renderGameProps(el, id){
  const list = document.createElement('div'); el.appendChild(list);
  function refresh(){
    list.innerHTML = '';
    GameProps.list(id).forEach(gp=>{
      const row = document.createElement('div'); row.className='flex items-center gap-1 py-1';
      const name = document.createElement('input'); name.value=gp.name; name.className='w-24 bg-slate-700 text-xs px-1';
      const type = document.createElement('select'); ['bool','int','float','string'].forEach(t=>{ const o=document.createElement('option'); o.value=t;o.textContent=t; if(gp.type===t)o.selected=true; type.appendChild(o); });
      type.className='bg-slate-700 text-xs';
      const val = document.createElement('input'); val.value=gp.value; val.className='flex-1 bg-slate-700 text-xs px-1';
      const del = document.createElement('button'); del.textContent='×'; del.className='text-red-400 px-1';
      del.onclick=()=>{ GameProps.remove(id, gp.name); refresh(); };
      name.onchange=()=>{ GameProps.rename(id, gp.name, name.value); refresh(); };
      type.onchange=()=>{ GameProps.set(id, gp.name, type.value, val.value); refresh(); };
      val.onchange=()=>{ GameProps.set(id, gp.name, gp.type, val.value); refresh(); };
      row.append(name,type,val,del); list.appendChild(row);
    });
  }
  refresh();
  const add = document.createElement('button'); add.textContent='Ajouter'; add.className='mt-2 px-2 py-1 bg-slate-700 text-xs';
  add.onclick=()=>{ GameProps.set(id,'prop','bool',false); refresh(); };
  el.appendChild(add);
}
