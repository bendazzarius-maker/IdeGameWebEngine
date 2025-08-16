// Inspecteur métamorphique : charge des sous-modules selon le contexte

import { EventBus } from '../../system/event_bus.js';
import { getContext, onContextChanged } from '../../context.js';
import * as viewport3d from './inspector_viewport.js';
import * as visual from './inspector_visual.js';
import * as code from './inspector_code.js';
import * as audio from './inspector_audio.js';

// Modules associés à chaque contexte
const registry = {
  viewport_3d: viewport3d,
  visual_scripting: visual,
  code,
  audio
};

let root;

export function initInspector(el){
  root = el || document.getElementById('inspector');
  if(!root) return;
  // Réagir aux changements de contexte global
  onContextChanged(render);
  EventBus.on('objectSelected', render);
  EventBus.on('gamePropChanged', render);
  EventBus.on('gamePropRemoved', render);
  EventBus.on('gamePropRenamed', render);
  render();
}

function render(){
  if(!root) return;
  const ctx = getContext();
  const mod = registry[ctx];
  root.innerHTML = '';
  mod?.render?.(root);
}

export default { initInspector };
