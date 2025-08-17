<template>
  <li :data-id="node.id">
    <div class="pl-2">
      {{ node.name ?? '(sans nom)' }}
      <span class="opacity-60 text-xs">({{ node.id }})</span>
    </div>
    <ul v-if="hasChildren" class="ml-3 border-l pl-3">
      <TreeItem v-for="child in node.children" :key="child" :id="child" :nodes="nodes" />
    </ul>
  </li>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  id: { type: String, required: true },
  nodes: { type: Object, required: true },
})
const node = computed(() => props.nodes?.[props.id] ?? { id: props.id, name: '(inconnu)', children: [] })
const hasChildren = computed(() => Array.isArray(node.value.children) && node.value.children.length > 0)
</script>
