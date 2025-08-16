// Bloc 1 imports
import bus from '../core/bus.js';
import { OutlinerService } from './outliner.service.js';
import AnimationService from './animation.service.js';

// Bloc 2 state / types / constantes
const TYPE = { MESH:'MESH', ARMATURE:'ARMATURE', CAMERA:'CAMERA', LIGHT:'LIGHT', EMPTY:'EMPTY' };

// Bloc 3 opérateurs
function importGLTF(json){
  if(!json) return;
  const nodeMap = new Map();
  (json.scenes||[]).forEach((scene,si)=>{
    const colId = OutlinerService.createCollection(OutlinerService.rootId(), scene.name||`Scene${si}`);
    (scene.nodes||[]).forEach(nid=> traverseNode(nid,null,colId,json,nodeMap));
  });
  AnimationService.loadClipsFromGLTF(json);
  bus.emit('outliner:loaded', OutlinerService.snapshot());
}
function traverseNode(idx,parentId,collectionId,json,nodeMap){
  const node = json.nodes[idx];
  const type = node.mesh!==undefined?TYPE.MESH:
               node.skin!==undefined?TYPE.ARMATURE:
               node.camera!==undefined?TYPE.CAMERA:
               node.light!==undefined?TYPE.LIGHT:TYPE.EMPTY;
  const obj = {
    id: node.name||`Node${idx}`,
    name: node.name||`Node${idx}`,
    type,
    parentId,
    collectionId,
    visible:true,
    locked:false,
    extras: node.extras||{}
  };
  const oid = OutlinerService.addObject(obj,parentId,collectionId);
  nodeMap.set(idx,oid);
  (node.children||[]).forEach(cid=> traverseNode(cid,oid,collectionId,json,nodeMap));
}

// Bloc 4 exports
export default { importGLTF };
