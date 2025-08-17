// Bloc 1 imports
import { OutlinerService } from '../services/outliner.service.js';
import bus from '../core/bus.js';

// Bloc 2 constantes/dictionnaires
const ICONS = { MESH:'🧊', ARMATURE:'🦴', CAMERA:'📷', LIGHT:'💡', EMPTY:'◻️', COLLECTION:'🗂️' };

// Bloc 3 opérateurs
function render(root){
  const snap = OutlinerService.snapshot();
  const sel = new Set(OutlinerService.getSelection());
  root.innerHTML = '';
  const ul = document.createElement('ul');
  root.appendChild(ul);
  buildCollection(snap.rootId, ul, snap, sel);
}

function buildCollection(id, parent, snap, sel){
  const col = snap.collections[id];
  if(!col) return;
  const li = document.createElement('li');
  li.dataset.id = col.id;
  li.dataset.type = 'collection';
  const head = document.createElement('div');
  head.textContent = `${ICONS.COLLECTION} ${col.name}`;
  head.onclick = e=> select(col.id, e);
  head.oncontextmenu = e=>{ e.preventDefault(); if(confirm('Delete collection?')) OutlinerService.removeCollection(col.id); };
  li.appendChild(head);
  const ul = document.createElement('ul');
  li.appendChild(ul);
  col.children.forEach(cid=> buildCollection(cid, ul, snap, sel));
  col.objects.forEach(oid=> buildObject(oid, ul, snap, sel));
  parent.appendChild(li);
}

function buildObject(id, parent, snap, sel){
  const obj = snap.objects[id];
  if(!obj) return;
  const li = document.createElement('li');
  li.dataset.id = obj.id;
  li.dataset.type = 'object';
  li.draggable = true;
  li.className = sel.has(obj.id) ? 'selected' : '';

  const vis = document.createElement('span');
  vis.textContent = obj.visible ? '👁️' : '🙈';
  vis.onclick = e=>{ e.stopPropagation(); OutlinerService.toggleVisible(obj.id); };

  const name = document.createElement('span');
  name.textContent = `${ICONS[obj.type]||''} ${obj.name}`;
  name.onclick = e=> select(obj.id, e);
  name.oncontextmenu = e=>{
    e.preventDefault();
    const act = prompt('Action? delete|unparent');
    if(act==='delete') OutlinerService.removeObject(obj.id);
    else if(act==='unparent') OutlinerService.reparent(obj.id, null);
  };

  li.append(vis, name);

  if(obj.children && obj.children.length){
    const ul = document.createElement('ul');
    obj.children.forEach(cid=> buildObject(cid, ul, snap, sel));
    li.appendChild(ul);
  }

  parent.appendChild(li);
}

function select(id, e){
  if(e.ctrlKey || e.metaKey) OutlinerService.toggleSelect(id);
  else OutlinerService.selectOnly(id);
}

export function mountOutliner(container){
  if(!container) return;
  render(container);
  OutlinerService.on(()=>{
    render(container);
    bus.emit('selection:change', OutlinerService.getSelection());
  });

  container.addEventListener('dragstart', e=>{
    const li = e.target.closest('li[data-id]');
    if(li) e.dataTransfer.setData('text/plain', li.dataset.id);
  });
  container.addEventListener('dragover', e=> e.preventDefault());
  container.addEventListener('drop', e=>{
    e.preventDefault();
    const target = e.target.closest('li[data-id]');
    const id = e.dataTransfer.getData('text/plain');
    if(!target || !id) return;
    const parentId = target.dataset.id;
    OutlinerService.reparent(id, parentId);
  });
}

// Bloc 4 exports
export default { mountOutliner };
