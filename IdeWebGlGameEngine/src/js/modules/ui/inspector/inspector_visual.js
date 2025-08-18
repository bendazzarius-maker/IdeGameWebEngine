// PATH: src/js/modules/ui/inspector/inspector_visual.js
// Bloc 1 — imports
import { EventBus } from '../../system/event_bus.js';
import * as GameProps from '../../data/game_properties.js';
import CodeGen from '../../../services/codegen.service.js';

// Bloc 2 — dictionaries / constants
let currentId = null;
EventBus.on('selection.changed', data=>{ currentId = typeof data === 'object' ? data.id : data; });

// Bloc 3 — classes / functions / logic
export function render(el){
  const id = currentId;
  if(!id){ el.textContent='Sélectionnez un node pour voir ses propriétés'; return; }
  renderGameProps(el, id);
  renderActions(el, id);
}
function renderGameProps(el, id){
  const list = document.createElement('div'); el.appendChild(list);
  function refresh(){
    list.innerHTML = '';
    GameProps.list(id).forEach(gp=>{
      const row = document.createElement('div'); row.className='flex items-center gap-1 py-1';
      const name = document.createElement('input'); name.value=gp.name; name.className='w-24 bg-slate-700 text-xs px-1';
      const type = document.createElement('select'); ['bool','int','float','string'].forEach(t=>{ const o=document.createElement('option'); o.value=t;o.textContent=t; if(gp.type===t)o.selected=true; type.appendChild(o); }); type.className='bg-slate-700 text-xs';
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
function renderActions(el, id){
  const wrap = document.createElement('div'); wrap.className='mt-4 flex gap-2';
  const gen = document.createElement('button'); gen.textContent='Generate JS'; gen.className='px-2 py-1 bg-slate-700 text-xs';
  gen.onclick=()=>{ CodeGen.generate({ id }, 'Node'+id); };
  const sim = document.createElement('button'); sim.textContent='Simulate'; sim.className='px-2 py-1 bg-slate-700 text-xs';
  sim.onclick=()=>{ CodeGen.simulate({ id }); };
  wrap.append(gen, sim); el.appendChild(wrap);
}

// Bloc 4 — event wiring / init
export default { render };
