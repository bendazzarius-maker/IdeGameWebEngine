// PATH: src/js/modules/world/volume.js
// Bloc 1 — imports
import bus from '../../core/bus.js';

// Bloc 2 — dictionaries / constants
let params = { density:0.02, anisotropy:0, distance:25 };

// Bloc 3 — classes / functions / logic
export function updateVolume(p){
  Object.assign(params, p);
  bus.emit('shader.world.volume.changed', { ...params });
}
export function getParams(){ return { ...params }; }

// Bloc 4 — event wiring / init
export default { updateVolume, getParams };
