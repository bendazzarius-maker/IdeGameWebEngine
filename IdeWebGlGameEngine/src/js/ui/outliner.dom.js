// Bloc 1 imports
import { OutlinerService } from '../services/outliner.service.js';
import Assets from '../services/assets.service.js';

// Bloc 2 constantes/dictionnaires
const ICONS = { COLLECTION:'🗂️', MESH:'🧊', ARMATURE:'🦴', BONE:'🦴', CAMERA:'📷', LIGHT:'💡', EMPTY:'◻️', GROUP:'◻️' };
const ASSET_ICONS = { image:'🖼️', audio:'🎵', video:'📹', shader:'🎨', code:'📄', model:'🧊' };

// Bloc 3 opérateurs
export function mountOutliner(root){
  if(!root) return;
  const CLS = {
    tree: root.dataset.treeClass || 'outliner__tree',
    node: root.dataset.nodeClass || 'outliner__node',
    twisty: root.dataset.twistyClass || 'outliner__twisty',
    vis: root.dataset.visClass || 'outliner__vis',
    name: root.dataset.nameClass || 'outliner__name',
    actions: root.dataset.actionsClass || 'outliner__actions',
    toolbar: root.dataset.toolbarClass || 'outliner__toolbar',
    btn: root.dataset.btnClass || 'outliner__btn',
    selected: root.dataset.selectedClass || 'outliner--selected',
  };
  let filter = '';

  // toolbar
  const toolbar = root.querySelector('[data-role="outliner-toolbar"]') || (()=>{const t=document.createElement('div');t.dataset.role='outliner-toolbar';root.appendChild(t);return t;})();
  toolbar.classList.add(CLS.toolbar);
  if(!toolbar._init){
    toolbar.innerHTML = `<button data-act="new" class="${CLS.btn}">+ New Collection</button>
    <button data-act="expand" class="${CLS.btn}">Expand All</button>
    <button data-act="collapse" class="${CLS.btn}">Collapse All</button>
    <input data-role="search" class="${CLS.btn}" type="search" placeholder="Search"/>
    <button data-act="unparent" class="${CLS.btn}">Unparent</button>
    <button data-act="delete" class="${CLS.btn}">Delete</button>`;
    const search = toolbar.querySelector('[data-role="search"]');
    search.addEventListener('input', e=>{ filter = e.target.value.toLowerCase(); render(); });
    toolbar.addEventListener('click', e=>{
      const act = e.target.dataset.act;
      if(!act) return;
      e.preventDefault();
      const sel = OutlinerService.getSelection();
      if(act==='new'){ OutlinerService.registerCollection(Date.now().toString(36),'Collection'); }
      else if(act==='expand'){ traverse('root', id=>OutlinerService.setExpanded(id,true)); render(); }
      else if(act==='collapse'){ traverse('root', id=>OutlinerService.setExpanded(id,false)); render(); }
      else if(act==='unparent' && sel){ OutlinerService.reparent(sel,'root'); }
      else if(act==='delete' && sel){ OutlinerService.removeNode(sel); }
    });
    toolbar._init = true;
  }

  const treeRoot = root.querySelector('ul') || root.appendChild(document.createElement('ul'));
  treeRoot.className = CLS.tree;

  function traverse(id,fn){ fn(id); OutlinerService.getChildren(id).forEach(cid=>traverse(cid,fn)); }
  function matches(id){ if(!filter) return true; const name=OutlinerService.getName(id).toLowerCase(); if(name.includes(filter)) return true; return OutlinerService.getChildren(id).some(matches); }

  function render(){
    treeRoot.innerHTML = '';
    OutlinerService.getChildren('root').forEach(id=> buildNode(id, treeRoot));
  }

  function buildNode(id, parent){
    const kids = OutlinerService.getChildren(id);
    const matchSelf = OutlinerService.getName(id).toLowerCase().includes(filter);
    const childMatches = kids.filter(matches);
    if(filter && !matchSelf && childMatches.length===0) return;

    const li = document.createElement('li');
    li.className = CLS.node;
    li.dataset.id = id;
    li.draggable = !OutlinerService.isLocked(id);

    const row = document.createElement('div');
    const twisty = document.createElement('span');
    twisty.className = CLS.twisty;
    const expanded = filter ? true : OutlinerService.getExpanded(id);
    twisty.textContent = kids.length ? (expanded?'▾':'▸') : '';
    twisty.onclick = e=>{ e.stopPropagation(); if(kids.length){ OutlinerService.setExpanded(id,!expanded); render(); } };

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
    if(OutlinerService.getSelection()===id) li.classList.add(CLS.selected);

    const showKids = expanded && (filter ? childMatches.length : kids.length);
    if(showKids){
      const ul = document.createElement('ul');
      (filter ? childMatches : kids).forEach(cid=> buildNode(cid, ul));
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
