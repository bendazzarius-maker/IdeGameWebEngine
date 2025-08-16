// Inspecteur métamorphique : charge des sous-modules selon le contexte

import { EventBus } from '../../system/event_bus.js';
import { getContexte } from '../../system/context.js';
import * as viewport from './inspector_viewport.js';
import * as visual from './inspector_visual.js';
import * as audio from './inspector_audio.js';

const registry = {
  viewport,
  visual_scripting: visual,
  audio
};

let root;

export function initInspector(el){
  root = el || document.getElementById('inspector');
  if(!root) return;
  EventBus.on('contextChanged', render);
  EventBus.on('objectSelected', render);
  EventBus.on('gamePropChanged', render);
  render();
}

function render(){
  if(!root) return;
  const ctx = getContexte();
  const mod = registry[ctx];
  root.innerHTML = '';
  mod?.render?.(root);
}

export default { initInspector };
