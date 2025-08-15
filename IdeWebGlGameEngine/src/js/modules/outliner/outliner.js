import { OutlinerService } from '../../services/outliner.service.js';

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const CLS = {
  item:        'flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-slate-700 cursor-default',
  itemActive:  'bg-slate-700 ring-1 ring-blue-400',
  icon:        'inline-block w-3 text-slate-400',
  label:       'ml-1 text-slate-200 truncate',
  actions:     'opacity-0 group-hover:opacity-100 transition',
  dropTarget:  'ring-1 ring-green-400',
};

let unsub = null;

function renderCollectionLi(col, snapshot, { onSelect, onAddCol, onAddObj, onRename, onRemove, onDrop }) {
  const li = document.createElement('li');
  li.className = 'group';
  li.dataset.kind = 'collection';
  li.dataset.id = col.id;
  li.draggable = true;

  const row = document.createElement('div');
  row.className = CLS.item;
  row.innerHTML = `
    <span class="${CLS.icon}">📁</span>
    <span class="${CLS.label}">${col.name}</span>
    <span class="${CLS.actions} flex gap-1">
      <button data-act="add-col"   class="px-1 rounded bg-slate-600 hover:bg-slate-500">+C</button>
      <button data-act="add-obj"   class="px-1 rounded bg-slate-600 hover:bg-slate-500">+O</button>
      <button data-act="rename"    class="px-1 rounded bg-slate-600 hover:bg-slate-500">✎</button>
      <button data-act="remove"    class="px-1 rounded bg-red-600/70 hover:bg-red-600">×</button>
    </span>
  `;
  row.addEventListener('click', (e) => {
    if ((e.target instanceof HTMLElement) && e.target.dataset.act) return;
    onSelect({ kind: 'collection', id: col.id, multi: e.ctrlKey || e.metaKey, shift: e.shiftKey });
  });
  row.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'add-col') return onAddCol(col.id);
    if (act === 'add-obj') return onAddObj(col.id);
    if (act === 'rename')  return onRename('collection', col.id);
    if (act === 'remove')  return onRemove('collection', col.id);
  });
  li.appendChild(row);

  const ul = document.createElement('ul');
  ul.className = 'pl-4 border-l border-slate-700/60 ml-2 my-1 space-y-1';

  (col.children || []).forEach(cid => {
    const child = snapshot.collections[cid];
    if (child) ul.appendChild(renderCollectionLi(child, snapshot, { onSelect, onAddCol, onAddObj, onRename, onRemove, onDrop }));
  });

  (col.objects || []).forEach(oid => {
    const obj = snapshot.objects[oid];
    if (obj) ul.appendChild(renderObjectLi(obj, { onSelect, onRename, onRemove }));
  });

  li.appendChild(ul);

  setupDropTargetForCollection(li, onDrop);

  li.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind:'collection', id: col.id }));
    e.dataTransfer.effectAllowed = 'move';
  });

  return li;
}

function renderObjectLi(obj, { onSelect, onRename, onRemove }) {
  const li = document.createElement('li');
  li.className = 'group';
  li.dataset.kind = 'object';
  li.dataset.id = obj.id;
  li.draggable = true;

  const row = document.createElement('div');
  row.className = CLS.item;
  row.innerHTML = `
    <span class="${CLS.icon}">🔹</span>
    <span class="${CLS.label}">${obj.name}</span>
    <span class="${CLS.actions} flex gap-1">
      <button data-act="rename" class="px-1 rounded bg-slate-600 hover:bg-slate-500">✎</button>
      <button data-act="remove" class="px-1 rounded bg-red-600/70 hover:bg-red-600">×</button>
    </span>
  `;
  row.addEventListener('click', (e) => {
    onSelect({ kind: 'object', id: obj.id, multi: e.ctrlKey || e.metaKey, shift: e.shiftKey });
  });
  row.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'rename')  return onRename('object', obj.id);
    if (act === 'remove')  return onRemove('object', obj.id);
  });
  li.appendChild(row);

  li.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind:'object', id: obj.id }));
    e.dataTransfer.effectAllowed = 'move';
  });

  return li;
}

function setupDropTargetForCollection(li, onDrop) {
  li.addEventListener('dragover', (e) => {
    const data = getDnDData(e);
    if (!data) return;
    e.preventDefault();
    li.firstChild.classList.add(CLS.dropTarget);
  });
  li.addEventListener('dragleave', () => li.firstChild.classList.remove(CLS.dropTarget));
  li.addEventListener('drop', (e) => {
    li.firstChild.classList.remove(CLS.dropTarget);
    const data = getDnDData(e);
    if (!data) return;
    onDrop({ targetCollectionId: li.dataset.id, data });
  });
}
function getDnDData(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return null; }
}

export function renderOutliner(panelEl) {
  if (!panelEl) return;
  panelEl.innerHTML = `
    <div class="px-2 py-1 text-[10px] uppercase text-slate-400">Outliner</div>
    <div class="px-2 pb-2 flex gap-1">
      <button data-act="add-col-root" class="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600">+ Collection</button>
      <button data-act="add-obj-root" class="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600">+ Objet</button>
    </div>
    <ul data-role="tree" class="px-2 pb-3 space-y-1"></ul>
  `;

  const tree = $('[data-role="tree"]', panelEl);
  const snap = OutlinerService.snapshot();

  const onSelect = ({ id, multi }) => {
    if (!multi) OutlinerService.selectOnly(id);
    else        OutlinerService.toggleSelect(id);
    highlightSelection(panelEl);
  };
  const onAddCol = (parentId) => {
    const id = OutlinerService.createCollection('Collection', parentId);
    OutlinerService.selectOnly(id);
    renderOutliner(panelEl);
  };
  const onAddObj = (collectionId) => {
    const id = OutlinerService.createObject('Object', 'Empty', collectionId);
    OutlinerService.selectOnly(id);
    renderOutliner(panelEl);
  };
  const onRename = (kind, id) => {
    const name = prompt('New name:');
    if (!name) return;
    if (kind === 'collection') OutlinerService.renameCollection(id, name);
    else                       OutlinerService.renameObject(id, name);
    renderOutliner(panelEl);
  };
  const onRemove = (kind, id) => {
    if (!confirm('Delete?')) return;
    if (kind === 'collection') OutlinerService.removeCollection(id);
    else                       OutlinerService.removeObject(id);
    renderOutliner(panelEl);
  };
  const onDrop = ({ targetCollectionId, data }) => {
    if (data.kind === 'object')  OutlinerService.moveObject(data.id, targetCollectionId);
    if (data.kind === 'collection') OutlinerService.moveCollection(data.id, targetCollectionId);
    renderOutliner(panelEl);
  };

  const root = snap.collections[snap.rootId];
  if (root) {
    tree.appendChild(renderCollectionLi(root, snap, { onSelect, onAddCol, onAddObj, onRename, onRemove, onDrop }));
  }

  panelEl.querySelector('[data-act="add-col-root"]').onclick = () => onAddCol(snap.rootId);
  panelEl.querySelector('[data-act="add-obj-root"]').onclick = () => onAddObj(snap.rootId);

  highlightSelection(panelEl);
}

function highlightSelection(panelEl) {
  const selected = new Set(OutlinerService.getSelection());
  $$('[data-kind="object"],[data-kind="collection"]', panelEl).forEach(el => {
    const row = el.firstChild;
    const isSel = selected.has(el.dataset.id);
    row.classList.toggle('bg-slate-700', isSel);
    row.classList.toggle('ring', isSel);
    row.classList.toggle('ring-blue-400', isSel);
  });
}

export function mountOutliner(panelEl) {
  if (!panelEl) return;
  renderOutliner(panelEl);
  unsub?.();
  unsub = OutlinerService.on(() => {
    renderOutliner(panelEl);
  });
}
