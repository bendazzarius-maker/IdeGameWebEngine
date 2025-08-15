import { OutlinerService } from '../../services/outliner.service.js';
import { GameProps } from '../../services/gameprops.service.js';

const _registry = new Map(); // tabKey -> panels[]
let _rootEl = null;
let _activeTab = null;
let _unsubs = [];

export function registerPanel(tabKey, panel){
  if(!_registry.has(tabKey)) _registry.set(tabKey, []);
  _registry.get(tabKey).push(panel);
}
export function initInspector(rootEl){
  _rootEl = rootEl || document.querySelector('#inspector,[data-role="inspector"]');
  if (!_rootEl) return;
  // (ré)abonnements
  _unsubs.forEach(fn=>fn()); _unsubs = [];
  if (OutlinerService?.on) {
    _unsubs.push(OutlinerService.on((evt)=>{ if (evt==='selection' || evt?.startsWith?.('object:') ) render(); }));
  }
  if (GameProps?.on) {
    _unsubs.push(GameProps.on(()=> render()));
  }
  render();
}
export function switchInspector(tabKey){
  _activeTab = tabKey;
  render();
}

function render(){
  if (!_rootEl || !_activeTab) return;
  _rootEl.innerHTML = '';
  const panels = _registry.get(_activeTab) || [];
  panels.forEach(p => {
    const card = document.createElement('div');
    card.className = 'mb-3 rounded-xl border border-slate-700 bg-slate-800';
    const head = document.createElement('div');
    head.className = 'px-3 py-2 text-xs uppercase text-slate-400';
    head.textContent = p.title;
    const body = document.createElement('div');
    body.className = 'p-3 text-sm';
    p.render(body, { OutlinerService, GameProps });
    card.appendChild(head); card.appendChild(body);
    _rootEl.appendChild(card);
  });
}

/* --------- Panneau Game Properties (présent sur plusieurs onglets) -------- */
const GPPanel = {
  id: 'gp',
  title: 'Game Properties',
  render(el, { OutlinerService, GameProps }){
    const sel = OutlinerService?.getSelection?.() || [];
    const objectId = sel[0] || null;

    const info = document.createElement('div');
    info.className='text-xs text-slate-400 mb-2';
    info.textContent = objectId ? `Selected: ${objectId}` : 'Select an object in Outliner';
    el.appendChild(info);

    if(!objectId) return;

    const list = document.createElement('div'); el.appendChild(list);
    function refresh(){
      list.innerHTML = '';
      (GameProps?.list(objectId) || []).forEach(gp => {
        const row = document.createElement('div');
        row.className='flex items-center gap-2 py-1';
        const name = document.createElement('input'); name.value=gp.name; name.className='w-28 text-xs bg-slate-700 rounded px-2 py-1';
        const type = document.createElement('select'); ['number','string','bool','vector'].forEach(t=>{ const o=document.createElement('option'); o.value=t;o.textContent=t; if(t===gp.type)o.selected=true; type.appendChild(o); });
        type.className='text-xs bg-slate-700 rounded px-1 py-1';
        const val  = document.createElement('input'); val.value=gp.value; val.className='flex-1 text-xs bg-slate-700 rounded px-2 py-1';
        const del  = document.createElement('button'); del.textContent='×'; del.className='px-2 py-1 bg-red-600/70 rounded text-xs';
        del.onclick = ()=>{ GameProps.remove(objectId, gp.name); refresh(); };
        name.onchange = ()=>{ GameProps.rename(objectId, gp.name, name.value); refresh(); };
        type.onchange = ()=>{ GameProps.set(objectId, gp.name, type.value, gp.value); refresh(); };
        val.onchange  = ()=>{ GameProps.set(objectId, gp.name, gp.type, val.value); refresh(); };
        row.append(name, type, val, del);
        list.appendChild(row);
      });
    }
    refresh();

    const add = document.createElement('button');
    add.textContent = 'Add Property';
    add.className = 'mt-2 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs';
    add.onclick = ()=>{ GameProps.set(objectId, 'prop', 'number', 0); refresh(); };
    el.appendChild(add);
  }
};

// enregistrer sur plusieurs contextes
['visual','code','viewport3d','audio','animation'].forEach(tab=> registerPanel(tab, GPPanel));

export default { initInspector, switchInspector, registerPanel };
