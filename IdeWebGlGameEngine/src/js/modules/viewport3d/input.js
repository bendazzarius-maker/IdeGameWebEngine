export function attachInput(canvas, state){
  function fit(){
    const r = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio||1);
    const w = Math.max(1, Math.floor(r.width*dpr));
    const h = Math.max(1, Math.floor(r.height*dpr));
    if (canvas.width!==w || canvas.height!==h){ canvas.width=w; canvas.height=h; }
  }
  window.addEventListener('resize', fit); fit();

  let dragging=false, lastX=0, lastY=0;
  canvas.addEventListener('mousedown', (e)=>{ if(e.button===0){dragging=true; lastX=e.clientX; lastY=e.clientY;} });
  window.addEventListener('mouseup', ()=> dragging=false);
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    const dx=(e.clientX-lastX)*0.01, dy=(e.clientY-lastY)*0.01; lastX=e.clientX; lastY=e.clientY;
    const c=state.camera, p=c.pos;
    p[0] = p[0]*Math.cos(dx) + p[2]*Math.sin(dx);
    p[2] = p[2]*Math.cos(dx) - p[0]*Math.sin(dx);
    p[1] += dy*3.0;
  });
  canvas.addEventListener('wheel', (e)=>{
    e.preventDefault();
    const c=state.camera, p=c.pos;
    const s = Math.exp((e.deltaY>0?-1:1)*0.05);
    p[0]*=s; p[1]*=s; p[2]*=s;
  }, { passive:false });

  window.addEventListener('keydown', (e)=>{
    const k=e.code;
    if (k==='Numpad5'){ state.camera.mode = (state.camera.mode==='persp'?'ortho':'persp'); }
    if (k==='Numpad1'){ state.camera.pos=[0,0,6]; state.camera.up=[0,1,0]; }
    if (k==='Numpad3'){ state.camera.pos=[6,0,0]; state.camera.up=[0,1,0]; }
    if (k==='Numpad7'){ state.camera.pos=[0,6,0]; state.camera.up=[0,0,-1]; }
    if (k==='Numpad9'){ const p=state.camera.pos; state.camera.pos=[-p[0],-p[1],-p[2]]; }
  });
}
