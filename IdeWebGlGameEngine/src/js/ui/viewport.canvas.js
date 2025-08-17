// Bloc 1 imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getScene } from '../modules/scene/scene.js';
import { OutlinerService } from '../services/outliner.service.js';

// Bloc 2 constantes/dictionnaires
// none

// Bloc 3 opérateurs
export function mountViewport(canvas){
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 2, 5);
  const controls = new OrbitControls(camera, canvas);

  function resize(){
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('pointerdown', e=>{
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(getScene().children, true);
    if(hits[0]) OutlinerService.selectOnly(hits[0].object.id);
  });

  function animate(){
    requestAnimationFrame(animate);
    renderer.render(getScene(), camera);
  }
  animate();
}

// Bloc 4 exports
export default { mountViewport };
