// Gestion des Game Properties attachées aux objets ou nodes
// Chaque propriété est stockée dans un dictionnaire par objet

import { EventBus } from '../system/event_bus.js';

const _store = new Map(); // objectId -> Map(name -> {type,value})

function _ensure(id){ if(!_store.has(id)) _store.set(id, new Map()); return _store.get(id); }

export function list(id){
  return Array.from(_ensure(id).entries()).map(([name, {type,value}])=>({ name, type, value }));
}

export function set(id, name, type, value){
  const props = _ensure(id);
  props.set(name, { type, value });
  EventBus.emit('gamePropChanged', { id, name, type, value });
}

export function remove(id, name){
  const props = _ensure(id);
  props.delete(name);
  EventBus.emit('gamePropRemoved', { id, name });
}

export function rename(id, oldName, newName){
  const props = _ensure(id);
  if(!props.has(oldName)) return;
  const data = props.get(oldName); props.delete(oldName); props.set(newName, data);
  EventBus.emit('gamePropRenamed', { id, oldName, newName });
}

export default { list, set, remove, rename };
