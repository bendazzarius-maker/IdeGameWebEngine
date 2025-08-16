// Moteur Three.js pour le viewport 3D

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EventBus } from '../system/event_bus.js';
import { getScene, addObject, getObject } from '../scene/scene.js';

let renderer, camera, controls, transform, dom;

// Initialise le viewport avec caméra, contrôles et boucle de rendu
export function initViewport3D(canvas){
  dom = canvas;
  const scene = getScene();
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  camera   = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 2, 5);
  controls = new OrbitControls(camera, canvas);
  transform = new TransformControls(camera, canvas);
  transform.addEventListener('dragging-changed', e=> controls.enabled = !e.value);
  scene.add(transform);

  canvas.addEventListener('pointerdown', onClick);
  window.addEventListener('resize', resize);
  resize();
  animate();

  // Attache les TransformControls sur l'objet sélectionné
  EventBus.on('objectSelected', data => {
    const id = typeof data === 'object' ? data.id : data;
    const obj = getObject(id);
    if (obj && transform) transform.attach(obj);
  });
}

// Ajoute une lumière de type demandé à la scène
export function addLight(kind){
  const scene = getScene();
  let light = null;
  if(kind === 'directional') light = new THREE.DirectionalLight(0xffffff, 1);
  if(kind === 'point')       light = new THREE.PointLight(0xffffff, 1);
  if(kind === 'spot')        light = new THREE.SpotLight(0xffffff, 1);
  if(!light) return null;
  light.position.set(2, 4, 2);
  const id = addObject(light);
  EventBus.emit('sceneUpdated');
  return id;
}

// Définit le mode des TransformControls (translate/rotate/scale)
export function setTransformMode(mode){
  transform?.setMode(mode);
}

function resize(){
  if(!renderer || !dom) return;
  const w = dom.clientWidth || window.innerWidth;
  const h = dom.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}

// Sélection d'objet via raycasting
function onClick(evt){
  const rect = dom.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((evt.clientX - rect.left) / rect.width) * 2 - 1,
    -((evt.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(getScene().children, true);
  if (hits[0]) {
    EventBus.emit('objectSelected', { id: hits[0].object.id });
  }
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(getScene(), camera);
}

export default { initViewport3D, addLight, setTransformMode };

