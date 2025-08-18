import bus from '../core/bus.js';

export function setHDRI(assetId, intensity, rotation){
  bus.emit('shader.world.hdri.changed', { assetId, intensity, rotation });
}

export function setVolume({ density, anisotropy, distance }){
  bus.emit('shader.world.volume.changed', { density, anisotropy, distance });
}

export default { setHDRI, setVolume };
