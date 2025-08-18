// PATH: src/js/modules/ui/inspector/inspector.js
// Bloc 1 — imports
import { EventBus } from '../../system/event_bus.js';
import { getContext, onContextChanged } from '../../context.js';
import * as viewport3d from './inspector_viewport.js';
import * as visual from './inspector_visual.js';
import * as code from './inspector_code.js';
import * as audio from './inspector_audio.js';
import * as shader from './inspector_shader.js';
import * as world from './inspector_world.js';

// Bloc 2 — dictionaries / constants
const registry = {
  viewport_3d: viewport3d,
  visual_scripting: visual,
  code,
  audio,
  shader,
  world,
};
let root;

// Bloc 3 — classes / functions / logic
export function initInspector(el){
  root = el || document.getElementById('inspector');
  if(!root) return;
  onContextChanged(render);
  EventBus.on('selection.changed', render);
  render();
}
function render(){
  if(!root) return;
  const ctx = getContext();
  const mod = registry[ctx];
  root.innerHTML = '';
  mod?.render?.(root);
}

// Bloc 4 — event wiring / init
export default { initInspector };
