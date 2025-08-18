import World from '../../services/world.service.js';

export function mount(el){
  el.innerHTML = '';
  const hdriInt = document.createElement('input');
  hdriInt.type='range'; hdriInt.min='0'; hdriInt.max='2'; hdriInt.step='0.1'; hdriInt.value='1';
  const hdriRot = document.createElement('input');
  hdriRot.type='range'; hdriRot.min='0'; hdriRot.max='6.283'; hdriRot.step='0.1'; hdriRot.value='0';
  hdriInt.oninput = hdriRot.oninput = ()=> World.setHDRI(null, parseFloat(hdriInt.value), parseFloat(hdriRot.value));
  el.append('HDRI Intensity', hdriInt, 'Rotation', hdriRot, document.createElement('br'));
  const density = document.createElement('input'); density.type='range'; density.min='0'; density.max='1'; density.step='0.01'; density.value='0';
  const anis = document.createElement('input'); anis.type='range'; anis.min='-1'; anis.max='1'; anis.step='0.01'; anis.value='0';
  const dist = document.createElement('input'); dist.type='range'; dist.min='0'; dist.max='10'; dist.step='0.1'; dist.value='1';
  const upd = ()=> World.setVolume({ density: parseFloat(density.value), anisotropy: parseFloat(anis.value), distance: parseFloat(dist.value) });
  density.oninput = anis.oninput = dist.oninput = upd;
  el.append('Density', density, 'Anisotropy', anis, 'Distance', dist);
}

export default { mount };
