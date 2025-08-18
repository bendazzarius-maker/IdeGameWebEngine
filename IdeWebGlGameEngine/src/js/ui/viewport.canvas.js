import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import bus from '../modules/system/event_bus.js';

export function setup({ canvas, scene, camera, renderer }) {
  const controls = new TransformControls(camera, canvas);
  scene.add(controls);

  bus.on('selection.changed', ({ id }) => {
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj) controls.attach(obj); else controls.detach();
  });

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
      bus.emit('selection.changed', { id: intersects[0].object.uuid });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') controls.setMode('translate');
    if (e.key === 'e') controls.setMode('rotate');
    if (e.key === 'r') controls.setMode('scale');
  });
}

export default { setup };
