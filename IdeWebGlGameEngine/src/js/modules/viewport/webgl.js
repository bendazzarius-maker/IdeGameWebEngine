// /src/js/modules/viewport/webgl.js
export function initGL(canvas, fpsEl){
  const gl = canvas?.getContext?.('webgl2') || canvas?.getContext?.('webgl'); if(!gl) return;
  let last=performance.now(), frames=0;
  function resize(){ const dpr=Math.min(2,window.devicePixelRatio||1); const w=canvas.clientWidth,h=canvas.clientHeight; canvas.width=w*dpr; canvas.height=h*dpr; gl.viewport(0,0,canvas.width,canvas.height); }
  new ResizeObserver(resize).observe(canvas);
  function hslToRgb(h,s,l){ const a=s*Math.min(l,1-l); const f=(n,k=(n+h*12)%12)=>l-a*Math.max(Math.min(k-3,9-k,1),-1); return [f(0),f(8),f(4)]; }
  (function tick(){ const t=performance.now(); frames++; if(t-last>=1000){ fpsEl.textContent=frames; frames=0; last=t; } const hue=(t/50)%360; const [r,g,b]=hslToRgb(hue/360,0.3,0.12); gl.clearColor(r,g,b,1); gl.clear(gl.COLOR_BUFFER_BIT); requestAnimationFrame(tick); })();
}
