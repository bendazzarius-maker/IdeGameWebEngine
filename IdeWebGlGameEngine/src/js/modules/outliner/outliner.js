// PATH: src/js/modules/outliner/outliner.js
// Bloc 1 — imports
import { mountOutliner } from '../../ui/outliner.dom.js';

// Bloc 2 — dictionaries / constants
// (none)

// Bloc 3 — classes / functions / logic
export function mount(root){
  mountOutliner(root);
}

// Bloc 4 — event wiring / init
export default { mount };
