// Importation d'objets GLTF 2.0

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addObject } from '../scene/scene.js';
import { EventBus } from '../system/event_bus.js';

export function importGLTF(file){
  const loader = new GLTFLoader();
  const url = typeof file === 'string' ? file : URL.createObjectURL(file);
  loader.load(url, (gltf)=>{
    const obj = gltf.scene || new THREE.Object3D();
    obj.name = obj.name || 'GLTF';
    // Ajoute l'objet importé à la scène
    const id = addObject(obj);
    // Informe l'interface qu'un nouvel objet est présent et le sélectionne
    EventBus.emit('scene.updated');
    EventBus.emit('object.add', { id });
    EventBus.emit('selection.changed', { id });
    if(file instanceof File) URL.revokeObjectURL(url);
  });
}

export default { importGLTF };
