<template>
  <div class="outliner">
    <ul>
      <CollectionNode :id="tree.rootId" />
    </ul>
  </div>
</template>

<script>
// BLOCK 1 — imports
import { reactive, computed } from 'vue';
import bus from '../js/core/bus.js';
import { OutlinerService } from '../js/services/outliner.service.js';

// BLOCK 2 — state / types / constants
const icons = { COLLECTION:'🗂️', MESH:'🧊', ARMATURE:'🦴', CAMERA:'📷', LIGHT:'💡', EMPTY:'◻️' };
const tree = reactive(OutlinerService.snapshot());
const selection = reactive({ ids: OutlinerService.getSelection() });

// BLOCK 3 — operators
function refresh() { Object.assign(tree, OutlinerService.snapshot()); }
OutlinerService.on(evt => {
  if (evt === 'selection') {
    selection.ids = OutlinerService.getSelection();
  } else {
    refresh();
  }
});
function isSel(id) { return selection.ids.includes(id); }
function select(id) { OutlinerService.selectOnly(id); selection.ids = OutlinerService.getSelection(); bus.emit('selection:change', id); }
function toggleVis(id) { OutlinerService.toggleVisible(id); refresh(); }
function toggleLock(id) { OutlinerService.toggleLocked(id); refresh(); }
function dragStart(id, e) { e.dataTransfer.setData('text/plain', id); }
function allowDrop(e) { e.preventDefault(); }
function dropOnObject(targetId, e) {
  const id = e.dataTransfer.getData('text/plain');
  if (!id || id === targetId) return;
  OutlinerService.reparent(id, targetId);
  refresh();
}
function dropOnCollection(colId, e) {
  const id = e.dataTransfer.getData('text/plain');
  if (!id) return;
  OutlinerService.moveToCollection(id, colId);
  refresh();
}
const ObjectNode = {
  name: 'ObjectNode',
  props: ['id'],
  setup(props) {
    const obj = computed(() => tree.objects[props.id]);
    return { obj, icons, isSel, select, toggleVis, toggleLock, dragStart, allowDrop, dropOnObject };
  },
  template: `
    <li :class="{selected:isSel(obj.id)}" draggable="true" @dragstart="dragStart(obj.id,$event)" @dragover="allowDrop" @drop="dropOnObject(obj.id,$event)">
      <span @click.stop="toggleVis(obj.id)">{{ obj.visible ? '👁️' : '🙈' }}</span>
      <span @click.stop="toggleLock(obj.id)">{{ obj.locked ? '🔒' : '🔓' }}</span>
      <span @click="select(obj.id)">{{ icons[obj.type] }} {{ obj.name }}</span>
      <ul v-if="obj.children.length">
        <ObjectNode v-for="cid in obj.children" :key="cid" :id="cid" />
      </ul>
    </li>`
};
const CollectionNode = {
  name: 'CollectionNode',
  props: ['id'],
  components: { ObjectNode },
  setup(props) {
    const col = computed(() => tree.collections[props.id]);
    return { col, icons, allowDrop, dropOnCollection, select };
  },
  template: `
    <li>
      <div @click="select(col.id)">{{ icons.COLLECTION }} {{ col.name }}</div>
      <ul @dragover="allowDrop" @drop="dropOnCollection(col.id,$event)">
        <CollectionNode v-for="cid in col.children" :key="cid" :id="cid" />
        <ObjectNode v-for="oid in col.objects" :key="oid" :id="oid" />
      </ul>
    </li>`
};
CollectionNode.components.CollectionNode = CollectionNode;

// BLOCK 4 — exports
export default { name: 'Outliner', components: { CollectionNode } };
</script>
