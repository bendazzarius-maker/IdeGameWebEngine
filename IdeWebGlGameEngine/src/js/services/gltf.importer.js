// Bloc 1 imports
import { OutlinerService } from './outliner.service.js';
import bus from '../core/bus.js';

// Bloc 2 constantes/dictionnaires
const { TYPE } = OutlinerService;

// Bloc 3 opérateurs
export async function importGLTF(url){
  const res = await fetch(url);
  const json = await res.json();
  const name = url.split('/').pop().replace(/\.gltf$/i,'').replace(/\.glb$/i,'');
  const importId = Date.now().toString(36);
  const colId = OutlinerService.registerCollection(importId, name);
  const jointNodes = new Set();
  (json.skins||[]).forEach(s=> (s.joints||[]).forEach(j=> jointNodes.add(j)));
  function nodeType(idx){
    const node = json.nodes[idx];
    if(jointNodes.has(idx)) return TYPE.BONE;
    if(node.mesh!==undefined) return TYPE.MESH;
    if(node.skin!==undefined) return TYPE.ARMATURE;
    if(node.camera!==undefined) return TYPE.CAMERA;
    if(node.light!==undefined) return TYPE.LIGHT;
    return TYPE.EMPTY;
  }
  const traverse = (idx,parentId)=>{
    const n = json.nodes[idx];
    const id = n.name || `node${idx}`;
    OutlinerService.addNode({ id, name:n.name||id, type:nodeType(idx), parentId });
    (n.children||[]).forEach(c=> traverse(c,id));
  };
  (json.scenes?.[0]?.nodes||[]).forEach(n=> traverse(n,colId));
  bus.emit('scene.updated');
  return { collectionId: colId, name };
}

// Bloc 4 exports
export default { importGLTF };
