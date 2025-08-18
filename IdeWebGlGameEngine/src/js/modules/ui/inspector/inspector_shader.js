// PATH: src/js/modules/ui/inspector/inspector_shader.js
// Bloc 1 — imports
// (none)

// Bloc 2 — dictionaries / constants
const el = { root:null };

// Bloc 3 — classes / functions / logic
export function mount(root){
  el.root = root;
  render();
}
function render(){
  if(!el.root) return;
  el.root.innerHTML = `
    <div class="p-2 space-y-2 text-sm">
      <label class="block">Base Color <input data-role="base" type="color" class="ml-2"></label>
      <label class="block">Roughness <input data-role="rough" type="range" min="0" max="1" step="0.01" class="ml-2"></label>
      <label class="block">Metallic <input data-role="metal" type="range" min="0" max="1" step="0.01" class="ml-2"></label>
    </div>`;
}

// Bloc 4 — event wiring / init
export default { mount };
