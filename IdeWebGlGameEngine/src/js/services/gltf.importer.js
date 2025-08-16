// BLOCK 1 — imports
import bus from '../core/bus.js';
import { OutlinerService } from './outliner.service.js';

// BLOCK 2 — state / types / constants
const TYPE = { MESH:'MESH', ARMATURE:'ARMATURE', CAMERA:'CAMERA', LIGHT:'LIGHT', EMPTY:'EMPTY' };

// BLOCK 3 — operators
function importGLTF(json) {
  if (!json) return;
  (json.scenes || []).forEach((scene, si) => {
    const colId = OutlinerService.createCollection(OutlinerService.rootId(), scene.name || `Scene${si}`);
    (scene.nodes || []).forEach(nid => traverseNode(nid, null, colId, json));
  });
  const clips = (json.animations || []).map((a, i) => a.name || `Anim${i}`);
  if (clips.length) bus.emit('animation:clips', clips);
  bus.emit('outliner:loaded', OutlinerService.snapshot());
}
function traverseNode(index, parentId, collectionId, json) {
  const node = json.nodes?.[index];
  if (!node) return;
  const type = node.camera !== undefined ? TYPE.CAMERA :
               node.extensions?.KHR_lights_punctual ? TYPE.LIGHT :
               node.skin !== undefined ? TYPE.ARMATURE :
               node.mesh !== undefined ? TYPE.MESH : TYPE.EMPTY;
  const obj = {
    id: node.name || `Node${index}`,
    name: node.name || `Node${index}`,
    type,
    parentId,
    collectionId,
    visible: true,
    locked: false,
    extras: node.extras || {}
  };
  const oid = OutlinerService.addObject(obj, parentId, collectionId);
  (node.children || []).forEach(cid => traverseNode(cid, oid, collectionId, json));
}

// BLOCK 4 — exports
export default { importGLTF };
