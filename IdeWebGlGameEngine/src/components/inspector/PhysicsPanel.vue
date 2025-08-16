<template>
  <div v-if="id">
    <h3>Physics</h3>
    <fieldset>
      <legend>Collider</legend>
      <select v-model="collider.type" @change="apply">
        <option>box</option><option>sphere</option><option>capsule</option><option>mesh</option>
      </select>
      <div v-if="collider.type==='box'">
        <input type="number" step="0.001" v-model.number="collider.size[0]" @change="apply" />
        <input type="number" step="0.001" v-model.number="collider.size[1]" @change="apply" />
        <input type="number" step="0.001" v-model.number="collider.size[2]" @change="apply" />
      </div>
      <div v-else-if="collider.type==='sphere'">
        <input type="number" step="0.001" v-model.number="collider.radius" @change="apply" />
      </div>
      <div v-else-if="collider.type==='capsule'">
        <input type="number" step="0.001" v-model.number="collider.radius" @change="apply" />
        <input type="number" step="0.001" v-model.number="collider.height" @change="apply" />
      </div>
      <div>
        <label>Offset</label>
        <input type="number" step="0.001" v-model.number="collider.offset[0]" @change="apply" />
        <input type="number" step="0.001" v-model.number="collider.offset[1]" @change="apply" />
        <input type="number" step="0.001" v-model.number="collider.offset[2]" @change="apply" />
      </div>
      <label><input type="checkbox" v-model="collider.isTrigger" @change="apply" />Trigger</label>
    </fieldset>
    <fieldset>
      <legend>Body</legend>
      <select v-model="body.mode" @change="apply">
        <option>Static</option><option>Dynamic</option><option>Kinematic</option>
      </select>
      <input type="number" step="0.001" v-model.number="body.mass" @change="apply" placeholder="Mass" />
      <input type="number" step="0.001" v-model.number="body.friction" @change="apply" placeholder="Friction" />
      <input type="number" step="0.001" v-model.number="body.restitution" @change="apply" placeholder="Restitution" />
      <label><input type="checkbox" v-model="body.ccd" @change="apply" />CCD</label>
      <input type="number" step="0.001" v-model.number="body.gravityScale" @change="apply" placeholder="Gravity" />
    </fieldset>
  </div>
  <div v-else>Physics: no selection</div>
</template>

<script>
// Bloc 1 imports
import { reactive, ref } from 'vue';
import bus from '../../js/core/bus.js';
import { OutlinerService } from '../../js/services/outliner.service.js';

// Bloc 2 state / types / constantes
const id = ref(null);
const collider = reactive({ type:'box', size:[1,1,1], radius:0.5, height:1, offset:[0,0,0], isTrigger:false });
const body = reactive({ mode:'Static', mass:1, friction:0.5, restitution:0, ccd:false, gravityScale:1 });

// Bloc 3 opérateurs
function load(target){
  id.value = target;
  if(!target) return;
  const obj = OutlinerService.snapshot().objects[target];
  Object.assign(collider, { type:'box', size:[1,1,1], radius:0.5, height:1, offset:[0,0,0], isTrigger:false }, obj?.extras?.collider || {});
  Object.assign(body, { mode:'Static', mass:1, friction:0.5, restitution:0, ccd:false, gravityScale:1 }, obj?.extras?.body || {});
}
function apply(){
  if(!id.value) return;
  const obj = OutlinerService.snapshot().objects[id.value];
  const extras = { ...(obj.extras||{}), collider: { ...collider }, body: { ...body } };
  OutlinerService.setExtras(id.value, extras);
  bus.emit('physics:changed', { id:id.value, collider:{...collider}, body:{...body} });
}
bus.on('selection:change', sel => load(sel[0]));

// Bloc 4 exports
export default { name:'PhysicsPanel', setup(){ return { id, collider, body, apply }; } };
</script>
