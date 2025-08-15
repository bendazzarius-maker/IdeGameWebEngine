import { initRenderer, drawScene } from './renderer.js';
import { attachInput } from './input.js';
import { addCube, addPlane } from './primitives.js';
import bus from '../../core/bus.js';
import object3DManager from '../../../core/Object3DManager.js';

const state = {
  gl: null, canvas: null,
  camera: { mode:'persp', pos:[3,3,3], target:[0,0,0], up:[0,1,0], fov:60, orthoSize:5 },
  scene: { objects: [] },
};

bus.on('object3d:add', (obj) => {
  if (!state.scene.objects.includes(obj)) state.scene.objects.push(obj);
});

bus.on('object3d:remove', (obj) => {
  const idx = state.scene.objects.indexOf(obj);
  if (idx !== -1) state.scene.objects.splice(idx, 1);
});

export function initViewport3D(canvas){
  state.canvas = canvas;
  const gl = canvas.getContext('webgl', { antialias:true, alpha:false });
  if (!gl) throw new Error('WebGL not supported');
  state.gl = gl;
  initRenderer(gl, state);
  attachInput(canvas, state);
  const plane = addPlane(state.scene, { size:10, color:[0.2,0.2,0.25], grid:true });
  const cube = addCube(state.scene, { size:1, color:[0.8,0.3,0.3] });
  object3DManager.add(plane);
  object3DManager.add(cube);
  requestAnimationFrame(loop);
}
function loop(){ drawScene(state.gl, state); requestAnimationFrame(loop); }
export function setView(mode){ state.camera.mode=mode; }
export function numpadView(key){
  const c = state.camera; const d = 6;
  if (key==='Numpad1') { c.pos=[0,0,d]; c.up=[0,1,0]; }
  if (key==='Numpad3') { c.pos=[d,0,0]; c.up=[0,1,0]; }
  if (key==='Numpad7') { c.pos=[0,d,0]; c.up=[0,0,-1]; }
  if (key==='Numpad5') { c.mode = (c.mode==='persp'?'ortho':'persp'); }
  if (key==='Numpad9') { c.pos=[-c.pos[0], -c.pos[1], -c.pos[2]]; }
}
export default { initViewport3D, numpadView };
