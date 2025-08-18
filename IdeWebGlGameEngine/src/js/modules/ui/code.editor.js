// PATH: src/js/modules/ui/code.editor.js
// Bloc 1 — imports
import bus from '../../core/bus.js';

// Bloc 2 — dictionaries / constants
const el = { root:null, textarea:null };

// Bloc 3 — classes / functions / logic
export function mount(root){
  el.root = root;
  el.root.innerHTML = '<textarea data-role="code" class="w-full h-full"></textarea>';
  el.textarea = el.root.querySelector('textarea');
}
export function setValue(code){ if(el.textarea) el.textarea.value = code; }
export function getValue(){ return el.textarea?.value || ''; }

// Bloc 4 — event wiring / init
export default { mount, setValue, getValue };
