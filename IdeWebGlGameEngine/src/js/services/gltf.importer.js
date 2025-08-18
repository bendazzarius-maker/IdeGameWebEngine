import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bus from '../core/bus.js';
import { OutlinerService } from './outliner.service.js';

export function importGLTF(file, collectionId = OutlinerService.rootId()) {
  const loader = new GLTFLoader();
  const url = typeof file === 'string' ? file : URL.createObjectURL(file);
  loader.load(url, (gltf) => {
    const scene = gltf.scene;
    const traverse = (obj, parentId) => {
      const id = OutlinerService.addObject({ id: obj.uuid, name: obj.name || obj.type }, parentId, collectionId);
      bus.emit('object.add', { id, parentId, name: obj.name });
      obj.children.forEach(ch => traverse(ch, id));
    };
    traverse(scene, null);
    bus.emit('scene.updated', { type: 'add', id: scene.uuid, object: scene });
    if (file instanceof File) URL.revokeObjectURL(url);
  });
}

export default { importGLTF };
