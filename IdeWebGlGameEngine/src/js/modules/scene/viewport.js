// Viewport 3D de base utilisant Three.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EventBus } from '../system/event_bus.js';
import { getScene, getObject } from './scene.js';

let renderer, camera, controls, transform, dom;

export function initViewport(canvas){
  dom = canvas;
  const scene = getScene();
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 2, 5);
  controls = new OrbitControls(camera, canvas);
  transform = new TransformControls(camera, canvas);
  transform.addEventListener('dragging-changed', e=> controls.enabled = !e.value);
  scene.add(transform);

  canvas.addEventListener('pointerdown', onClick);
  window.addEventListener('resize', resize);
  resize();
  animate();

  EventBus.on('objectSelected', id=>{
    const obj = getObject(id); if(obj) transform.attach(obj);
  });
}

function resize(){
  if(!renderer || !dom) return;
  const w = dom.clientWidth || window.innerWidth;
  const h = dom.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}

function onClick(evt){
  const rect = dom.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((evt.clientX-rect.left)/rect.width)*2-1,
    -((evt.clientY-rect.top)/rect.height)*2+1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(getScene().children, true);
  if(hits[0]){
    EventBus.emit('objectSelected', hits[0].object.id);
  }
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(getScene(), camera);
}
