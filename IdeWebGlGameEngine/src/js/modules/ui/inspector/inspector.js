import bus from '../../system/event_bus.js';
import * as viewport from './inspector_viewport.js';
import * as visual from './inspector_visual.js';
import * as shader from './inspector_shader.js';
import * as world from './inspector_world.js';
import * as audio from './inspector_audio.js';
import * as code from './inspector_code.js';

const panels = { viewport, visual, shader, world, audio, code };
let root = null;

export function mount(el) {
  root = el;
  bus.on('context.changed', ({ ctx }) => setContext(ctx));
}

export function setContext(ctx) {
  if (!root) return;
  root.innerHTML = '';
  const panel = panels[ctx];
  panel?.mount?.(root) || panel?.render?.(root);
}

export default { mount, setContext };
