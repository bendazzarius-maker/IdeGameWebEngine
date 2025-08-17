// Bloc 1 imports
import bus from '../core/bus.js';

// Bloc 2 constantes/dictionnaires
const TYPE = { COLLECTION:'COLLECTION', MESH:'MESH', ARMATURE:'ARMATURE', BONE:'BONE', CAMERA:'CAMERA', LIGHT:'LIGHT', EMPTY:'EMPTY', GROUP:'GROUP' };
const _state = {
  nodes: new Map(),
  expanded: new Map(),
  selection: null,
  listeners: new Set(),
};
_state.nodes.set('root',{ id:'root', name:'Root', type:TYPE.COLLECTION, parentId:null, children:[], visible:true, locked:false });

// Bloc 3 opérateurs
function notify(){ _state.listeners.forEach(fn=>fn()); }
function onChange(fn){ _state.listeners.add(fn); return ()=>_state.listeners.delete(fn); }
function addNode(node){
  const parent = _state.nodes.get(node.parentId || 'root');
  const n = { ...node, children: node.children || [], visible: node.visible !== false, locked: !!node.locked };
  _state.nodes.set(n.id,n);
  parent?.children.push(n.id);
  notify();
  return n.id;
}
function registerCollection(importId,name){
  const id = `col:${importId}`;
  addNode({ id, name, type:TYPE.COLLECTION, parentId:'root' });
  _state.expanded.set(id,true);
  return id;
}
function selectOnly(id){
  _state.selection = id;
  notify();
  bus.emit('selection:change', id);
}
function getSelection(){ return _state.selection; }
function toggleVisibility(id){
  const node = _state.nodes.get(id); if(!node) return;
  const val = !node.visible;
  const apply = nid=>{ const n=_state.nodes.get(nid); if(!n) return; n.visible=val; n.children.forEach(apply); };
  apply(id);
  notify();
  bus.emit('visibility:change', { id, visible: val });
}
function toggleLock(id){
  const node = _state.nodes.get(id); if(!node) return;
  const val = !node.locked;
  const apply = nid=>{ const n=_state.nodes.get(nid); if(!n) return; n.locked=val; n.children.forEach(apply); };
  apply(id);
  notify();
  bus.emit('lock:change', { id, locked: val });
}
function isLocked(id){ return _state.nodes.get(id)?.locked || false; }
function isVisible(id){ return _state.nodes.get(id)?.visible || false; }
function getType(id){ return _state.nodes.get(id)?.type || null; }
function getName(id){ return _state.nodes.get(id)?.name || ''; }
function getChildren(id){ return [...(_state.nodes.get(id)?.children || [])]; }
function reparent(id,newParentId){
  const node=_state.nodes.get(id); const parent=_state.nodes.get(newParentId);
  if(!node||!parent) return false;
  if(isLocked(id)) return false;
  let cur=newParentId; while(cur){ if(cur===id||isLocked(cur)) return false; cur=_state.nodes.get(cur)?.parentId; }
  const old=_state.nodes.get(node.parentId); if(old) old.children=old.children.filter(cid=>cid!==id);
  node.parentId=newParentId; parent.children.push(id);
  notify();
  bus.emit('reparent:done',{ id, newParentId });
  return true;
}
function setExpanded(id,bool){ _state.expanded.set(id,!!bool); }
function getExpanded(id){ return _state.expanded.get(id)||false; }
function removeNode(id){
  if(id==='root') return;
  const node=_state.nodes.get(id); if(!node) return;
  if(isLocked(id)) return;
  [...node.children].forEach(c=>removeNode(c));
  const parent=_state.nodes.get(node.parentId);
  if(parent) parent.children=parent.children.filter(cid=>cid!==id);
  _state.nodes.delete(id);
  if(_state.selection===id) _state.selection=null;
  notify();
}

// Bloc 4 exports
export const OutlinerService = {
  TYPE,
  registerCollection,
  addNode,
  selectOnly,
  getSelection,
  toggleVisibility,
  toggleLock,
  isLocked,
  isVisible,
  getType,
  getName,
  getChildren,
  reparent,
  setExpanded,
  getExpanded,
  removeNode,
  onChange,
};
export default OutlinerService;
