// Bloc 1 imports
import { OutlinerService } from './outliner.service.js';

// Bloc 2 constantes/dictionnaires
const { TYPE } = OutlinerService;

// Bloc 3 opérateurs
function nodeType(node){
  return node.mesh!==undefined?TYPE.MESH:
         node.skin!==undefined?TYPE.ARMATURE:
         node.camera!==undefined?TYPE.CAMERA:
         node.light!==undefined?TYPE.LIGHT:TYPE.EMPTY;
}
export async function importGLTF(url){
  const res = await fetch(url);
  const json = await res.json();
  const name = url.split('/').pop().replace(/\.gltf$/i,'').replace(/\.glb$/i,'');
  const importId = Date.now().toString(36);
  const colId = OutlinerService.registerCollection(importId, name);
  const traverse = (idx,parentId)=>{
    const n = json.nodes[idx];
    const id = n.name || `node${idx}`;
    OutlinerService.addNode({ id, name:n.name||id, type:nodeType(n), parentId });
    (n.children||[]).forEach(c=> traverse(c,id));
  };
  (json.scenes?.[0]?.nodes||[]).forEach(n=> traverse(n,colId));
  return { collectionId: colId, name };
}

// Bloc 4 exports
export default { importGLTF };
