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
    <div>Scale</div>
    <div>
      <input type="number" step="0.001" v-model.number="t.scl[0]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.scl[1]" @keydown="onKey" @change="apply" />
      <input type="number" step="0.001" v-model.number="t.scl[2]" @keydown="onKey" @change="apply" />
    </div>
    <div>
      <label>Space</label>
      <select v-model="t.space" @change="apply">
        <option>Local</option>
        <option>World</option>
      </select>
    </div>
    <div>Dimensions (m)
      <span>{{ t.dims[0].toFixed(3) }} {{ t.dims[1].toFixed(3) }} {{ t.dims[2].toFixed(3) }}</span>
    </div>
  </div>
  <div v-else>No selection</div>
</template>

<script>
// Bloc 1 imports
import { reactive, ref } from 'vue';
import bus from '../../js/core/bus.js';
import Transform from '../../js/services/transform.controller.js';

// Bloc 2 state / types / constantes
const t = reactive({ loc:[0,0,0], rot:[0,0,0], scl:[1,1,1], order:'XYZ', space:'Local', dims:[1,1,1] });
const currentId = ref(null);

// Bloc 3 opérateurs
function load(id){
  currentId.value = id;
  if(!id){ return; }
  Object.assign(t, Transform.get(id));
}
function apply(){
  if(!currentId.value) return;
  Transform.set(currentId.value, { loc:[...t.loc], rot:[...t.rot], scl:[...t.scl], order:t.order, space:t.space, dims:[...t.dims] });
}
function onKey(e){
  if(e.key==='Enter') apply();
  if(e.key==='Escape') load(currentId.value);
}
bus.on('selection:change', sel => load(sel[0]));
bus.on('transform:changed', ({id,t:tr})=>{ if(id===currentId.value) Object.assign(t,tr); });

// Bloc 4 exports
export default { name:'TransformInspector', setup(){ return { t, currentId, apply, onKey }; } };
</script>
