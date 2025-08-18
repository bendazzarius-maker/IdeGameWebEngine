// PATH: src/js/modules/ui/inspector/inspector_world.js
// Bloc 1 — imports
import World from '../../../services/world.service.js';

// Bloc 2 — dictionaries / constants
const el = { root:null };

// Bloc 3 — classes / functions / logic
export function mount(root){
  el.root = root;
  render();
}
function render(){
  if(!el.root) return;
  const w = World.getWorld();
  el.root.innerHTML = `
    <div class="p-2 space-y-2 text-sm">
      <label class="block">HDRI <input data-role="hdri" class="ml-2" placeholder="asset id"/></label>
      <label class="block">Intensity <input data-role="int" type="range" min="0" max="5" step="0.1" value="${w.intensity}" class="ml-2"/></label>
      <label class="block">Rotation <input data-role="rot" type="range" min="0" max="360" step="1" value="${w.rotation}" class="ml-2"/></label>
      <fieldset class="border p-2">
        <legend class="px-1">Volume</legend>
        <label class="block">Density <input data-role="dens" type="range" min="0" max="1" step="0.01" value="${w.volume.density}" class="ml-2"/></label>
        <label class="block">Anisotropy <input data-role="aniso" type="range" min="-1" max="1" step="0.01" value="${w.volume.anisotropy}" class="ml-2"/></label>
        <label class="block">Distance <input data-role="dist" type="range" min="0" max="100" step="1" value="${w.volume.distance}" class="ml-2"/></label>
      </fieldset>
    </div>`;
  wire();
}
function wire(){
  const w = World.getWorld();
  el.root.querySelector('[data-role="hdri"]').addEventListener('change', e=>World.setHDRI(e.target.value, w.intensity, w.rotation));
  el.root.querySelector('[data-role="int"]').addEventListener('input', e=>World.setHDRI(w.hdri, parseFloat(e.target.value), w.rotation));
  el.root.querySelector('[data-role="rot"]').addEventListener('input', e=>World.setHDRI(w.hdri, w.intensity, parseFloat(e.target.value)));
  el.root.querySelector('[data-role="dens"]').addEventListener('input', e=>World.setVolume({ density: parseFloat(e.target.value) }));
  el.root.querySelector('[data-role="aniso"]').addEventListener('input', e=>World.setVolume({ anisotropy: parseFloat(e.target.value) }));
  el.root.querySelector('[data-role="dist"]').addEventListener('input', e=>World.setVolume({ distance: parseFloat(e.target.value) }));
}

// Bloc 4 — event wiring / init
export default { mount };
