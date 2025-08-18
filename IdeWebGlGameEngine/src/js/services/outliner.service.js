// PATH: src/js/services/outliner.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
const TYPE = { COLLECTION:'COLLECTION', MESH:'MESH', ARMATURE:'ARMATURE', BONE:'BONE', CAMERA:'CAMERA', LIGHT:'LIGHT', EMPTY:'EMPTY', GROUP:'GROUP' };
const state = {
  nodes: new Map(),
  expanded: new Map(),
  selection: null,
  listeners: new Set(),
};
state.nodes.set('root',{ id:'root', name:'Root', type:TYPE.COLLECTION, parentId:null, children:[], visible:true, locked:false });

// Bloc 3 — classes / functions / logic
function notify(){ state.listeners.forEach(fn=>fn()); }
export function onChange(fn){ state.listeners.add(fn); return ()=>state.listeners.delete(fn); }
export function addNode(node){
  const parent = state.nodes.get(node.parentId || 'root');
  const n = { ...node, children: node.children || [], visible: node.visible !== false, locked: !!node.locked };
  state.nodes.set(n.id,n);
  parent?.children.push(n.id);
  notify();
  const evt = n.type===TYPE.COLLECTION ? 'collection.add' : 'object.add';
  bus.emit(evt, { id:n.id, parentId: parent?.id });
  return n.id;
}
export function registerCollection(importId,name){
  const id = `col:${importId}`;
  addNode({ id, name, type:TYPE.COLLECTION, parentId:'root' });
  state.expanded.set(id,true);
  return id;
}
export function rename(id,name){
  const node = state.nodes.get(id); if(!node) return;
  node.name = name;
  notify();
  const evt = node.type===TYPE.COLLECTION ? 'collection.rename' : 'object.rename';
  bus.emit(evt,{ id, name });
}
export function selectOnly(id){
  state.selection = id;
  notify();
  bus.emit('selection.changed',{ id });
}
export function getSelection(){ return state.selection; }
export function toggleVisibility(id){
  const node = state.nodes.get(id); if(!node) return;
  const val = !node.visible;
  const apply = nid=>{ const n=state.nodes.get(nid); if(!n) return; n.visible=val; n.children.forEach(apply); };
  apply(id);
  notify();
}
export function toggleLock(id){
  const node = state.nodes.get(id); if(!node) return;
  const val = !node.locked;
  const apply = nid=>{ const n=state.nodes.get(nid); if(!n) return; n.locked=val; n.children.forEach(apply); };
  apply(id);
  notify();
}
export function isLocked(id){ return state.nodes.get(id)?.locked || false; }
export function isVisible(id){ return state.nodes.get(id)?.visible || false; }
export function getType(id){ return state.nodes.get(id)?.type || null; }
export function getName(id){ return state.nodes.get(id)?.name || ''; }
export function getChildren(id){ return [...(state.nodes.get(id)?.children || [])]; }
export function reparent(id,newParentId){
  const node=state.nodes.get(id); const parent=state.nodes.get(newParentId);
  if(!node||!parent) return false;
  const old=state.nodes.get(node.parentId);
  if(old) old.children=old.children.filter(cid=>cid!==id);
  node.parentId=newParentId; parent.children.push(id);
  notify();
  bus.emit('object.move',{ id, parentId:newParentId });
  return true;
}
export function setExpanded(id,bool){ state.expanded.set(id,!!bool); }
export function getExpanded(id){ return state.expanded.get(id)||false; }
export function removeNode(id){
  if(id==='root') return;
  const node=state.nodes.get(id); if(!node) return;
  [...node.children].forEach(c=>removeNode(c));
  const parent=state.nodes.get(node.parentId);
  if(parent) parent.children=parent.children.filter(cid=>cid!==id);
  state.nodes.delete(id);
  if(state.selection===id) state.selection=null;
  notify();
  const evt = node.type===TYPE.COLLECTION ? 'collection.remove' : 'object.remove';
  bus.emit(evt,{ id });
}

// Bloc 4 — event wiring / init
export const OutlinerService = {
  TYPE,
  registerCollection,
  addNode,
  rename,
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
