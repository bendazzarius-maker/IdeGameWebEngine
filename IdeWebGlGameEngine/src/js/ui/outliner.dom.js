// Bloc 1 imports
import { OutlinerService } from '../services/outliner.service.js';

// Bloc 2 constantes/dictionnaires
const ICONS = { COLLECTION:'🗂️', MESH:'🧊', ARMATURE:'🦴', CAMERA:'📷', LIGHT:'💡', EMPTY:'◻️' };

// Bloc 3 opérateurs
export function mountOutliner(root){
  if(!root) return;
  const CLS = {
    tree: root.dataset.treeClass || 'tree',
    node: root.dataset.nodeClass || 'node',
    twisty: root.dataset.twistyClass || 'twisty',
    vis: root.dataset.visClass || 'vis',
    name: root.dataset.nameClass || 'name',
    actions: root.dataset.actionsClass || 'actions',
  };
  function render(){
    root.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = CLS.tree;
    root.appendChild(ul);
    OutlinerService.getChildren('root').forEach(id=> buildNode(id, ul));
  }
  function buildNode(id, parent){
    const li = document.createElement('li');
    li.className = CLS.node;
    li.dataset.id = id;
    li.draggable = !OutlinerService.isLocked(id);
    const row = document.createElement('div');
    const kids = OutlinerService.getChildren(id);
    const twisty = document.createElement('span');
    twisty.className = CLS.twisty;
    twisty.textContent = kids.length ? (OutlinerService.getExpanded(id)?'▾':'▸') : '';
    twisty.onclick = e=>{ e.stopPropagation(); if(kids.length){ OutlinerService.setExpanded(id,!OutlinerService.getExpanded(id)); render(); } };
    const icon = document.createElement('span');
    icon.textContent = ICONS[OutlinerService.getType(id)] || '';
    const name = document.createElement('span');
    name.className = CLS.name;
    name.textContent = OutlinerService.getName(id);
    const eye = document.createElement('button');
    eye.className = CLS.vis;
    eye.textContent = OutlinerService.isVisible(id) ? '👁️' : '🙈';
    eye.onclick = e=>{ e.stopPropagation(); OutlinerService.toggleVisibility(id); };
    const lock = document.createElement('button');
    lock.textContent = OutlinerService.isLocked(id) ? '🔒' : '🔓';
    lock.onclick = e=>{ e.stopPropagation(); OutlinerService.toggleLock(id); };
    const acts = document.createElement('span');
    acts.className = CLS.actions;
    acts.append(eye, lock);
    row.append(twisty, icon, name, acts);
    row.onclick = ()=>{ if(OutlinerService.isLocked(id)) return; OutlinerService.selectOnly(id); };
    li.appendChild(row);
    if(OutlinerService.getSelection()===id) li.classList.add('selected');
    if(kids.length && OutlinerService.getExpanded(id)){
      const ul = document.createElement('ul');
      kids.forEach(cid=> buildNode(cid, ul));
      li.appendChild(ul);
    }
    li.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', id); });
    li.addEventListener('dragover', e=>{ if(!OutlinerService.isLocked(id)) e.preventDefault(); });
    li.addEventListener('drop', e=>{ e.preventDefault(); const src=e.dataTransfer.getData('text/plain'); if(src && src!==id){ if(OutlinerService.reparent(src,id)) render(); } });
    parent.appendChild(li);
  }
  render();
  OutlinerService.onChange(render);
}

// Bloc 4 exports
export default { mountOutliner };
