/* ===== STATE ===== */
const _state = {
  collections: new Map(),
  objects: new Map(),
  rootId: 'root',
  selec: new Set(),
  listeners: new Set(),
  nextId: 1,
};
function emit(evt, payload){ _state.listeners.forEach(fn => fn(evt, payload)); }
function ensureRoot(){
  if (!_state.collections.has(_state.rootId)){
    _state.collections.set(_state.rootId, { id:_state.rootId, name:'Scene', parentId:null, children:new Set(), objects:new Set() });
  }
}
ensureRoot();

/* ===== API ===== */
export const OutlinerService = {
  on(fn){ _state.listeners.add(fn); return () => _state.listeners.delete(fn); },
  createCollection(name='Collection', parentId=_state.rootId){
    ensureRoot();
    const id = 'C' + (_state.nextId++);
    _state.collections.set(id, { id, name, parentId, children:new Set(), objects:new Set() });
    _state.collections.get(parentId)?.children.add(id);
    emit('collection:add', { id, parentId, name });
    return id;
  },
  renameCollection(id, name){ const c = _state.collections.get(id); if(!c) return; c.name=name; emit('collection:rename', {id,name}); },
  removeCollection(id){
    if (id===_state.rootId) return;
    const c=_state.collections.get(id); if(!c) return;
    c.children.forEach(cid => { _state.collections.get(cid).parentId=c.parentId; _state.collections.get(c.parentId)?.children.add(cid); });
    c.objects.forEach(oid => { const o=_state.objects.get(oid); if(o){ o.collectionId=c.parentId; _state.collections.get(c.parentId)?.objects.add(oid);} });
    _state.collections.get(c.parentId)?.children.delete(id);
    _state.collections.delete(id);
    emit('collection:remove', {id});
  },
  moveCollection(id, newParentId){
    const c=_state.collections.get(id); if(!c || id===_state.rootId) return;
    _state.collections.get(c.parentId)?.children.delete(id);
    c.parentId=newParentId;
    _state.collections.get(newParentId)?.children.add(id);
    emit('collection:move', {id,newParentId});
  },
  createObject(name='Object', type='Empty', collectionId=_state.rootId){
    const id = 'O' + (_state.nextId++);
    _state.objects.set(id, { id, name, type, collectionId });
    _state.collections.get(collectionId)?.objects.add(id);
    emit('object:add', { id, name, type, collectionId });
    return id;
  },
  renameObject(id, name){ const o=_state.objects.get(id); if(!o) return; o.name=name; emit('object:rename', {id,name}); },
  moveObject(id, targetCollectionId){
    const o=_state.objects.get(id); if(!o) return;
    _state.collections.get(o.collectionId)?.objects.delete(id);
    o.collectionId=targetCollectionId;
    _state.collections.get(targetCollectionId)?.objects.add(id);
    emit('object:move', {id, targetCollectionId});
  },
  removeObject(id){
    const o=_state.objects.get(id); if(!o) return;
    _state.collections.get(o.collectionId)?.objects.delete(id);
    _state.objects.delete(id);
    _state.selec.delete(id);
    emit('object:remove', {id});
  },
  clearSelection(){ _state.selec.clear(); emit('selection', new Set(_state.selec)); },
  selectOnly(id){ _state.selec.clear(); if(id) _state.selec.add(id); emit('selection', new Set(_state.selec)); },
  toggleSelect(id){ _state.selec.has(id)?_state.selec.delete(id):_state.selec.add(id); emit('selection', new Set(_state.selec)); },
  getSelection(){ return Array.from(_state.selec); },
  snapshot(){
    const c = {}; _state.collections.forEach((v,k)=> c[k]={...v, children:Array.from(v.children), objects:Array.from(v.objects)});
    const o = {}; _state.objects.forEach((v,k)=> o[k]={...v});
    return { collections:c, objects:o, rootId:_state.rootId };
  },
};
export default OutlinerService;
