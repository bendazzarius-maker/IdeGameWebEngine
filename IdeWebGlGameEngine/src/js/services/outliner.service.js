// Bloc 1 imports
// none

// Bloc 2 state / types / constantes
const _state = {
  collections: new Map(),
  objects: new Map(),
  rootId: 'root',
  selection: new Set(),
  listeners: new Set(),
  nextId: 1,
};
function emit(evt,p){ _state.listeners.forEach(fn=>fn(evt,p)); }
function ensureRoot(){
  if(!_state.collections.has(_state.rootId)){
    _state.collections.set(_state.rootId,{ id:_state.rootId, name:'Root', parentId:null, children:new Set(), objects:new Set() });
  }
}
ensureRoot();

// Bloc 3 opérateurs
function on(fn){ _state.listeners.add(fn); return ()=>_state.listeners.delete(fn); }
function rootId(){ return _state.rootId; }
function createCollection(parentId=_state.rootId,name='Collection',forceId){
  ensureRoot();
  const id = forceId || 'C'+(_state.nextId++);
  _state.collections.set(id,{ id,name,parentId,children:new Set(),objects:new Set() });
  _state.collections.get(parentId)?.children.add(id);
  emit('collection:add',{id,parentId,name});
  return id;
}
function renameCollection(id,name){ const c=_state.collections.get(id); if(!c) return; c.name=name; emit('collection:rename',{id,name}); }
function removeCollection(id){
  if(id===_state.rootId) return false;
  const c=_state.collections.get(id); if(!c) return false;
  if(c.children.size||c.objects.size) return false; // refuse if non empty
  _state.collections.get(c.parentId)?.children.delete(id);
  _state.collections.delete(id);
  emit('collection:remove',{id});
  return true;
}
function childrenOfCollection(id){ const c=_state.collections.get(id); if(!c) return {collections:[],objects:[]}; return { collections:[...c.children], objects:[...c.objects] }; }
function addObject(obj,parentId=null,collectionId=_state.rootId){
  const id = obj.id || 'O'+(_state.nextId++);
  const o = { id, name:obj.name||id, type:obj.type||'EMPTY', parentId, collectionId, children:new Set(), visible:obj.visible!==false, locked:obj.locked||false, extras:obj.extras||{} };
  _state.objects.set(id,o);
  if(parentId) _state.objects.get(parentId)?.children.add(id);
  _state.collections.get(collectionId)?.objects.add(id);
  emit('object:add',{...o});
  return id;
}
function renameObject(id,name){ const o=_state.objects.get(id); if(!o) return; o.name=name; emit('object:rename',{id,name}); }
function removeObject(id){
  const o=_state.objects.get(id); if(!o) return;
  [...o.children].forEach(cid=>removeObject(cid));
  _state.objects.get(o.parentId)?.children.delete(id);
  _state.collections.get(o.collectionId)?.objects.delete(id);
  _state.objects.delete(id);
  _state.selection.delete(id);
  emit('object:remove',{id});
}
function reparent(objectId,newParentId){
  const o=_state.objects.get(objectId); if(!o || objectId===newParentId) return;
  let cur=newParentId; while(cur){ if(cur===objectId) return; cur=_state.objects.get(cur)?.parentId; }
  _state.objects.get(o.parentId)?.children.delete(objectId);
  o.parentId=newParentId; _state.objects.get(newParentId)?.children.add(objectId);
  emit('object:reparent',{id:objectId,parentId:newParentId});
}
function moveToCollection(objectId,collectionId){ const o=_state.objects.get(objectId); if(!o) return; _state.collections.get(o.collectionId)?.objects.delete(objectId); o.collectionId=collectionId; _state.collections.get(collectionId)?.objects.add(objectId); emit('object:move',{id:objectId,collectionId}); }
function toggleVisible(id){ const o=_state.objects.get(id); if(!o) return; o.visible=!o.visible; emit('object:visible',{id,visible:o.visible}); }
function toggleLocked(id){ const o=_state.objects.get(id); if(!o) return; o.locked=!o.locked; emit('object:locked',{id,locked:o.locked}); }
function clearSelection(){ _state.selection.clear(); emit('selection', getSelection()); }
function selectOnly(id){ _state.selection.clear(); if(id) _state.selection.add(id); emit('selection', getSelection()); }
function toggleSelect(id){ _state.selection.has(id)?_state.selection.delete(id):_state.selection.add(id); emit('selection', getSelection()); }
function getSelection(){ return [..._state.selection]; }
function setExtras(id,extras){ const o=_state.objects.get(id); if(o) o.extras=extras; }
function snapshot(){
  const c={}; _state.collections.forEach((v,k)=> c[k]={ id:v.id,name:v.name,parentId:v.parentId,children:[...v.children],objects:[...v.objects] });
  const o={}; _state.objects.forEach((v,k)=>{ o[k]={ id:v.id,name:v.name,type:v.type,parentId:v.parentId,collectionId:v.collectionId,children:[...v.children],visible:v.visible,locked:v.locked,extras:v.extras }; });
  return { collections:c, objects:o, rootId:_state.rootId };
}

// Bloc 4 exports
export const OutlinerService = { on, rootId, createCollection, renameCollection, removeCollection, childrenOfCollection, addObject, renameObject, removeObject, reparent, moveToCollection, toggleVisible, toggleLocked, clearSelection, selectOnly, toggleSelect, getSelection, setExtras, snapshot };
export default OutlinerService;
