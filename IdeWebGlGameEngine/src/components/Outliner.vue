<template>
  <div class="outliner p-2">
    <div v-if="ready" class="text-sm">
      <div class="font-medium">Root: {{ safeTree.rootId }}</div>
      <ul class="mt-2 space-y-1">
        <TreeItem :id="safeTree.rootId" :nodes="safeTree.nodes" />
      </ul>
    </div>
    <div v-else class="opacity-70 text-sm">Outliner : données en attente…</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import TreeItem from './TreeItem.vue'

const props = defineProps({
  tree: { type: Object, required: false, default: undefined },
})

const injected = inject('outlinerTree', null)
const source = computed(() => props.tree ?? injected ?? null)

const safeTree = computed(() => {
  const t = source.value ?? {}
  return {
    rootId: t.rootId ?? null,
    nodes:  t.nodes  ?? {},
  }
})
const ready = computed(() => !!safeTree.value.rootId && !!safeTree.value.nodes)
</script>
