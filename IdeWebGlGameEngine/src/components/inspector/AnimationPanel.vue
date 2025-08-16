<template>
  <div v-if="id">
    <h3>Animation</h3>
    <div>
      <label>Clip</label>
      <select v-model="clip">
        <option v-for="c in clips" :key="c.name">{{c.name}}</option>
      </select>
      <label>Skeleton</label>
      <select v-model="skeleton">
        <option v-for="a in armatures" :key="a.id" :value="a.id">{{a.name}}</option>
      </select>
      <input type="number" step="0.001" v-model.number="blend" />
      <button @click="play">Play</button>
    </div>
    <div>
      <label>State Machine</label>
      <textarea v-model="sm" @change="saveSM"></textarea>
    </div>
  </div>
  <div v-else>Animation: no selection</div>
</template>

<script>
// Bloc 1 imports
import { ref, computed } from 'vue';
import bus from '../../js/core/bus.js';
import { OutlinerService } from '../../js/services/outliner.service.js';
import AnimationService from '../../js/services/animation.service.js';

// Bloc 2 state / types / constantes
const id = ref(null);
const clip = ref('');
const skeleton = ref('');
const blend = ref(0.2);
const clips = ref([]);
const sm = ref('');
const armatures = computed(()=>{
  const sn = OutlinerService.snapshot();
  return Object.values(sn.objects).filter(o=>o.type==='ARMATURE');
});

// Bloc 3 opérateurs
function load(target){
  id.value = target;
  if(!target) return;
  const obj = OutlinerService.snapshot().objects[target];
  clip.value = obj?.extras?.animationBindings?.clips?.[0] || '';
  skeleton.value = obj?.extras?.animationBindings?.skeletonNodeId || '';
  sm.value = JSON.stringify(obj?.extras?.stateMachine||{}, null, 2);
}
function play(){
  if(!skeleton.value || !clip.value) return;
  AnimationService.play(skeleton.value, clip.value, blend.value);
}
function saveSM(){
  if(!id.value) return;
  let parsed={};
  try{ parsed = JSON.parse(sm.value); }catch(e){ return; }
  const obj = OutlinerService.snapshot().objects[id.value];
  const extras = { ...(obj.extras||{}), animationBindings:{ skeletonNodeId:skeleton.value, clips:[clip.value] }, stateMachine:parsed };
  OutlinerService.setExtras(id.value, extras);
}
bus.on('animation:clips', c=>{ clips.value=c; });
bus.on('selection:change', sel=> load(sel[0]));

// Bloc 4 exports
export default { name:'AnimationPanel', setup(){ return { id, clip, skeleton, blend, clips, sm, armatures, play, saveSM }; } };
</script>
