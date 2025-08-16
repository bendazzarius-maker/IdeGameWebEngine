<template>
  <div class="outliner">
    <ul>
      <TreeCollection :id="tree.rootId" />
    </ul>
  </div>
</template>

<script>
// Bloc 1 imports
import { reactive, computed } from 'vue';
import { OutlinerService } from '../js/services/outliner.service.js';
import bus from '../js/core/bus.js';

// Bloc 2 state / types / constantes
const icons = { MESH:'🧊', ARMATURE:'🦴', CAMERA:'📷', LIGHT:'💡', EMPTY:'◻️', COLLECTION:'🗂️' };
const tree = reactive(OutlinerService.snapshot());
const selection = reactive({ ids: OutlinerService.getSelection() });

// Bloc 3 opérateurs
function refresh(){ Object.assign(tree, OutlinerService.snapshot()); }
OutlinerService.on(evt=>{ if(evt==='selection'){ selection.ids = OutlinerService.getSelection(); bus.emit('selection:change', selection.ids); } else refresh(); });
function isSel(id){ return selection.ids.includes(id); }
function select(id,e){ if(e.ctrlKey||e.metaKey) OutlinerService.toggleSelect(id); else OutlinerService.selectOnly(id); }
function toggleVis(o){ OutlinerService.toggleVisible(o.id); refresh(); }
function toggleLock(o){ OutlinerService.toggleLocked(o.id); refresh(); }
function rename(item,isCol){ const n=prompt('Rename', item.name); if(n) isCol?OutlinerService.renameCollection(item.id,n):OutlinerService.renameObject(item.id,n); }
function remove(item,isCol){ if(!confirm('Delete?')) return; isCol?OutlinerService.removeCollection(item.id):OutlinerService.removeObject(item.id); }
function context(item,isCol,e){ e.preventDefault(); const a=prompt('Action? rename|delete|move'); if(a==='rename') rename(item,isCol); else if(a==='delete') remove(item,isCol); else if(a==='move' && !isCol){ const t=prompt('Collection id'); if(t) OutlinerService.moveToCollection(item.id,t); } }
function dragStart(item,isCol,e){ if(isCol) return; e.dataTransfer.setData('text/plain', item.id); }
function dropObj(target,e){ const id=e.dataTransfer.getData('text/plain'); if(id) OutlinerService.reparent(id,target.id); }
function dropCol(target,e){ const id=e.dataTransfer.getData('text/plain'); if(id) OutlinerService.moveToCollection(id,target.id); }
function allow(e){ e.preventDefault(); }
const NodeObject = {
  name:'NodeObject',
  props:['id'],
  setup(p){ const obj = computed(()=> tree.objects[p.id]); return { obj, icons, isSel, select, toggleVis, toggleLock, dragStart, allow, dropObj, context }; },
  template:`
    <li :class="{selected:isSel(obj.id)}" draggable="true" @dragstart="dragStart(obj,false,$event)" @dragover="allow" @drop="dropObj(obj,$event)" @contextmenu="context(obj,false,$event)">
      <span @click.stop="toggleVis(obj)">{{ obj.visible ? '👁️' : '🙈' }}</span>
      <span @click.stop="toggleLock(obj)">{{ obj.locked ? '🔒' : '🔓' }}</span>
      <span @click="select(obj.id,$event)">{{ icons[obj.type] }} {{ obj.name }}</span>
      <ul v-if="obj.children && obj.children.length">
        <NodeObject v-for="cid in obj.children" :key="cid" :id="cid" />
      </ul>
    </li>`
};
const NodeCollection = {
  name:'NodeCollection',
  props:['id'],
  components:{ NodeObject },
  setup(p){ const col = computed(()=> tree.collections[p.id]); return { col, icons, select, allow, dropCol, context }; },
  template:`
    <li @contextmenu="context(col,true,$event)" @dragover="allow" @drop="dropCol(col,$event)">
      <div @click="select(col.id,$event)">{{ icons.COLLECTION }} {{ col.name }}</div>
      <ul>
        <NodeCollection v-for="cid in col.children" :key="cid" :id="cid" />
        <NodeObject v-for="oid in col.objects" :key="oid" :id="oid" />
      </ul>
    </li>`
};
NodeCollection.components.NodeCollection = NodeCollection;

// Bloc 4 exports
export default { name:'Outliner', components:{ TreeCollection:NodeCollection, TreeObject:NodeObject } };
</script>
