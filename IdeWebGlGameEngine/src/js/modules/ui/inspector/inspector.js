// PATH: src/js/modules/ui/inspector/inspector.js
// Bloc 1 — imports
// PATH: src/js/modules/ui/inspector/inspector.js
// Bloc 1 — imports
import { EventBus } from '../../system/event_bus.js';
import * as viewport from './inspector_viewport.js';
import * as visual from './inspector_visual.js';
import * as code from './inspector_code.js';
import * as audio from './inspector_audio.js';
import * as shader from './inspector_shader.js';
import * as world from './inspector_world.js';

// Bloc 2 — dictionaries / constants
// Bloc 2 — dictionaries / constants
const registry = {
  viewport,
  visual,
  code,
  audio,
  shader,
  world,
};
let root = null;
let current = null;
let activeCtx = null;

// Bloc 3 — classes / functions / logic
export function mount(el){
  root = el || document.getElementById('inspector');
  if(!root) return;
  EventBus.on('context.changed', data => setContext(data?.ctx ?? data));
  EventBus.on('selection.changed', () => { if(activeCtx) setContext(activeCtx); });
}

export function setContext(ctx){
  if(!root || !ctx) return;
  activeCtx = ctx;
  current?.unmount?.(root);
  root.innerHTML = '';
  const mod = registry[ctx];
  const fn = mod?.mount || mod?.render;
  fn?.(root);
  current = mod;
}

// Bloc 4 — event wiring / init
export default { mount, setContext };
