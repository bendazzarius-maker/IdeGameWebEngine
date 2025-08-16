// Gestion simplifiée de la scène Three.js

import * as THREE from 'three';
import { EventBus } from '../system/event_bus.js';

const scene = new THREE.Scene();
const objects = new Map(); // id -> Object3D
let counter = 0;

export function getScene(){ return scene; }

export function addObject(obj){
  const id = obj.id || `obj_${counter++}`;
  obj.name = obj.name || id;
  objects.set(id, obj);
  scene.add(obj);
  EventBus.emit('sceneUpdated', { type: 'add', id, object: obj });
  return id;
}

export function removeObject(id){
  const obj = objects.get(id);
  if(!obj) return;
  scene.remove(obj);
  objects.delete(id);
  EventBus.emit('sceneUpdated', { type: 'remove', id });
}

export function renameObject(id, name){
  const obj = objects.get(id); if(obj){ obj.name = name; EventBus.emit('sceneUpdated', { type: 'rename', id, name }); }
}

export function list(){
  return Array.from(objects.entries()).map(([id,obj])=>({ id, name: obj.name, type: obj.type }));
}

export function getObject(id){ return objects.get(id); }

export default { getScene, addObject, removeObject, renameObject, list, getObject };
