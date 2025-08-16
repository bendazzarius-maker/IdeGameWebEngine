<template>
  <div v-if="currentId">
    <h3>Transform</h3>
    <div>Location (m)</div>
    <div>
      <input type="number" step="0.001" v-model.number="t.loc[0]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.loc[1]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.loc[2]" @keydown="onKey" @change="apply" />
    </div>
    <div>Rotation (°)</div>
    <div>
      <input type="number" step="0.001" v-model.number="t.rot[0]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.rot[1]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.rot[2]" @keydown="onKey" @change="apply" />
      <select v-model="t.order" @change="apply">
        <option>XYZ</option><option>XZY</option><option>YXZ</option><option>YZX</option><option>ZXY</option><option>ZYX</option>
      </select>
    </div>
    <div>
      <label>Space</label>
      <select v-model="t.space" @change="apply">
        <option>LOCAL</option>
        <option>WORLD</option>
      </select>
    </div>
    <div>Scale</div>
    <div>
      <input type="number" step="0.001" v-model.number="t.scl[0]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.scl[1]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.scl[2]" @keydown="onKey" @change="apply" />
    </div>
    <div>Dimensions (m)</div>
    <div>
      <input type="number" readonly :value="t.dims[0].toFixed(3)" />
      <input type="number" readonly :value="t.dims[1].toFixed(3)" />
      <input type="number" readonly :value="t.dims[2].toFixed(3)" />
    </div>
  </div>
  <div v-else>No selection</div>
</template>

<script>
// BLOCK 1 — imports
import { reactive, ref } from 'vue';
import bus from '../../js/core/bus.js';
import Transform from '../../js/services/transform.controller.js';

// BLOCK 2 — state / types / constants
const t = reactive({ loc:[0,0,0], rot:[0,0,0], scl:[1,1,1], order:'XYZ', space:'LOCAL', dims:[0,0,0] });
const currentId = ref(null);

// BLOCK 3 — operators
function load(id) {
  currentId.value = id;
  if (!id) return;
  Object.assign(t, Transform.get(id));
}
function apply() {
  if (!currentId.value) return;
  const nt = { loc:[...t.loc], rot:[...t.rot], scl:[...t.scl], order:t.order, space:t.space, dims:[...t.dims] };
  Transform.set(currentId.value, nt);
  bus.emit('transform:changed', { id: currentId.value, t: nt });
}
function onKey(e) {
  if (e.key === 'Enter') apply();
  if (e.key === 'Escape') load(currentId.value);
}
bus.on('selection:change', id => load(id));
bus.on('transform:changed', ({ id, t: tr }) => { if (id === currentId.value) Object.assign(t, tr); });

// BLOCK 4 — exports
export default { name: 'TransformInspector', setup() { return { t, currentId, apply, onKey }; } };
</script>
