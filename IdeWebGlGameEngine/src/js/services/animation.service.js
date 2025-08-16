// Bloc 1 imports
import bus from '../core/bus.js';

// Bloc 2 state / types / constantes
const _clips = [];
const _bindings = new Map();

// Bloc 3 opérateurs
function loadClipsFromGLTF(json){
  _clips.length = 0;
  (json.animations||[]).forEach((a,i)=>{
    _clips.push({ name: a.name||`Clip${i}`, duration: a.duration||0, raw:a });
  });
  bus.emit('animation:clips', getClips());
}
function getClips(){ return _clips.map(c=>({ ...c })); }
function bindSkeleton(skeletonNodeId, clipName){
  _bindings.set(skeletonNodeId, clipName);
  bus.emit('animation:bind', { skeletonNodeId, clipName });
}
function play(skeletonNodeId, clipName, blendSeconds=0.2){
  bus.emit('animation:play', { skeletonNodeId, clipName, blendSeconds });
  // TODO mixer implementation
}

// Bloc 4 exports
export default { loadClipsFromGLTF, bindSkeleton, play, getClips };
