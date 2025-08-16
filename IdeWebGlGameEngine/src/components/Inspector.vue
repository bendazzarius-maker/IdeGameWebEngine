<template>
  <div>
    <div v-if="context==='viewport'">
      <TransformInspector v-if="selection" :key="selection" />
      <PhysicsPanel v-if="selection" />
      <AnimationPanel v-if="selection" />
    </div>
  </div>
</template>

<script>
// BLOCK 1 — imports
import { ref } from 'vue';
import bus from '../js/core/bus.js';
import TransformInspector from './inspector/TransformInspector.vue';
import PhysicsPanel from './inspector/PhysicsPanel.vue';
import AnimationPanel from './inspector/AnimationPanel.vue';

// BLOCK 2 — state / types / constants
const context = ref('viewport');
const selection = ref(null);

// BLOCK 3 — operators
bus.on('selection:change', id => selection.value = id);

// BLOCK 4 — exports
export default { name: 'Inspector', components: { TransformInspector, PhysicsPanel, AnimationPanel }, setup() { return { context, selection }; } };
</script>
