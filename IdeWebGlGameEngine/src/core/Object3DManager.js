// src/core/Object3DManager.js
// Gestion simple des objets 3D et diffusion d'événements

import bus from '../js/core/bus.js';

class Object3DManager {
  constructor(){
    this.objects = new Map();
    this._nextId = 1;
  }

  /** Ajoute un objet et notifie les modules */
  add(object){
    const id = object.id || `obj-${this._nextId++}`;
    object.id = id;
    this.objects.set(id, object);
    bus.emit('object3d:add', object);
    return id;
  }

  /** Supprime un objet et notifie */
  remove(id){
    const obj = this.objects.get(id);
    if (!obj) return;
    this.objects.delete(id);
    bus.emit('object3d:remove', obj);
  }

  /** Retourne un objet par son id */
  get(id){ return this.objects.get(id) || null; }

  /** Liste tous les objets */
  list(){ return Array.from(this.objects.values()); }
}

export const object3DManager = new Object3DManager();
export default object3DManager;
