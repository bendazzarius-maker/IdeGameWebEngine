<template>
  <div>
    <ViewportInspector v-if="context==='viewport'" />
  </div>
</template>

<script>
// Bloc 1 imports
import { ref } from 'vue';
import TransformInspector from './inspector/TransformInspector.vue';
import PhysicsPanel from './inspector/PhysicsPanel.vue';
import AnimationPanel from './inspector/AnimationPanel.vue';
import bus from '../js/core/bus.js';
import GameProps from '../js/services/gameprops.service.js';
import { OutlinerService } from '../js/services/outliner.service.js';

// Bloc 2 state / types / constantes
const context = ref('viewport');
const selection = ref([]);

// Bloc 3 opérateurs
bus.on('selection:change', sel=> selection.value = sel);
function persist(){
  const id = selection.value[0];
  if(!id) return;
  const obj = OutlinerService.snapshot().objects[id];
  const extras = { ...(obj.extras||{}), gameProps: GameProps.list(id) };
  OutlinerService.setExtras(id, extras);
}
const GamePropsPanel = {
  name:'GamePropsPanel',
  setup(){
    function list(){ return GameProps.list(selection.value[0]); }
    function add(){ const n=prompt('Name'); if(!n) return; GameProps.set(selection.value[0], n, 'Float', 0.0); persist(); bus.emit('gameprops:set'); }
    function rename(p){ const n=prompt('Rename',p.name); if(!n) return; GameProps.rename(selection.value[0], p.name, n); persist(); bus.emit('gameprops:rename'); }
    function remove(p){ GameProps.remove(selection.value[0], p.name); persist(); bus.emit('gameprops:remove'); }
    function move(p,d){ const arr=list(); const i=arr.findIndex(x=>x.name===p.name); const j=i+d; if(j<0||j>=arr.length) return; arr.splice(i,1); arr.splice(j,0,p); arr.forEach(pr=>GameProps.remove(selection.value[0], pr.name)); arr.forEach(pr=>GameProps.set(selection.value[0], pr.name, pr.type, pr.value)); persist(); bus.emit('gameprops:reorder'); }
    function info(p){ console.log('GameProp', p); }
    return { list, add, rename, remove, move, info };
  },
  template:`<div v-if="list().length || true"><h3>Game Properties</h3><div v-for="p in list()" :key="p.name"><span>{{p.name}} ({{p.type}})</span><button @click="() => rename(p)">Rename</button><button @click="() => remove(p)">Delete</button><button @click="() => move(p,-1)">↑</button><button @click="() => move(p,1)">↓</button><button @click="() => info(p)">(i)</button></div><button @click="add">Add</button></div>`
};
const ViewportInspector = { components:{ TransformInspector, GamePropsPanel, PhysicsPanel, AnimationPanel }, template:`<div><TransformInspector/><GamePropsPanel/><PhysicsPanel/><AnimationPanel/></div>` };

// Bloc 4 exports
export default { name:'Inspector', components:{ ViewportInspector }, setup(){ return { context }; } };
</script>
