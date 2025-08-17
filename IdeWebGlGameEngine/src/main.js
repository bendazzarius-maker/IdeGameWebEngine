import { createApp, reactive } from 'vue'
import Outliner from './components/Outliner.vue'
import Inspector from './components/Inspector.vue'
import bus from './js/core/bus.js'
import { OutlinerService } from './js/services/outliner.service.js'

const outlinerTree = reactive(OutlinerService.snapshot())
OutlinerService.on(() => Object.assign(outlinerTree, OutlinerService.snapshot()))

function init() {
  const outEl = document.querySelector('[data-role="outliner-list"]')
  if (outEl) {
    createApp(Outliner).provide('outlinerTree', outlinerTree).mount(outEl)
  }
  const inspEl = document.querySelector('[data-role="inspector"]')
  if (inspEl) createApp(Inspector).mount(inspEl)
  bus.emit('scene:ready')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}

export { outlinerTree }
