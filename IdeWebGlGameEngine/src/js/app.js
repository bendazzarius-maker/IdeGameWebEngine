// BLOCK 1 — imports
import { createApp } from 'vue';
import Outliner from '../components/Outliner.vue';
import Inspector from '../components/Inspector.vue';
import bus from './core/bus.js';

// BLOCK 2 — state / types / constants
const mounts = {
  outliner: '[data-role="outliner-list"]',
  inspector: '[data-role="inspector"]'
};

// BLOCK 3 — operators
function init() {
  const outEl = document.querySelector(mounts.outliner);
  if (outEl) createApp(Outliner).mount(outEl);
  const inspEl = document.querySelector(mounts.inspector);
  if (inspEl) createApp(Inspector).mount(inspEl);
  bus.emit('scene:ready');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

// BLOCK 4 — exports
export { init };
