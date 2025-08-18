// PATH: src/js/services/world.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
const world = { hdri:null, intensity:1, rotation:0, volume:{ density:0.02, anisotropy:0.0, distance:25 } };

// Bloc 3 — classes / functions / logic
export function setHDRI(assetId, intensity=1, rotation=0){
  world.hdri = assetId; world.intensity=intensity; world.rotation=rotation;
  bus.emit('shader.world.hdri.changed', { assetId, intensity, rotation });
}
export function setVolume(params){
  Object.assign(world.volume, params);
  bus.emit('shader.world.volume.changed', { ...world.volume });
}
export function getWorld(){ return world; }

// Bloc 4 — event wiring / init
export default { setHDRI, setVolume, getWorld };
