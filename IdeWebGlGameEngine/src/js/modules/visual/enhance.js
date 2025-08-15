import { createGraph } from './graph.js';

function installSelection(Graph) {
  if (Graph.prototype.__hasMarquee) return;
  Graph.prototype.__hasMarquee = true;

  Graph.prototype.enableMarquee = function(areaEl) {
    const g = this;
    const overlay = document.createElement('div');
    overlay.style.position='absolute';
    overlay.style.left='0'; overlay.style.top='0'; overlay.style.right='0'; overlay.style.bottom='0';
    overlay.style.pointerEvents='none';
    areaEl.appendChild(overlay);
    let start=null, rectEl=null;

    function getNodeBox(n){
      const el = n.view; if (!el) return null;
      const r = el.getBoundingClientRect();
      const a = areaEl.getBoundingClientRect();
      return { x:r.left-a.left, y:r.top-a.top, w:r.width, h:r.height, n };
    }
    function hit(b, x, y, w, h){ return !(b.x > x+w || b.x+b.w < x || b.y > y+h || b.y+b.h < y); }

    areaEl.addEventListener('mousedown', (e)=>{
      if (e.button!==0) return;
      if (e.target.closest && e.target.closest('.node')) return;
      start = { x:e.offsetX, y:e.offsetY };
      rectEl = document.createElement('div');
      Object.assign(rectEl.style, {
        position:'absolute', border:'1px dashed #93c5fd', background:'rgba(59,130,246,0.12)', pointerEvents:'none'
      });
      overlay.appendChild(rectEl);
    });
    areaEl.addEventListener('mousemove', (e)=>{
      if (!start || !rectEl) return;
      const x = Math.min(start.x, e.offsetX);
      const y = Math.min(start.y, e.offsetY);
      const w = Math.abs(e.offsetX - start.x);
      const h = Math.abs(e.offsetY - start.y);
      Object.assign(rectEl.style, { left:x+'px', top:y+'px', width:w+'px', height:h+'px' });

      const boxes = g.nodes.map(getNodeBox).filter(Boolean);
      g.nodes.forEach(n => { n.selected = false; n.view?.classList.remove('ring','ring-blue-400'); });
      boxes.forEach(b => { if (hit(b,x,y,w,h)) { b.n.selected = true; b.n.view?.classList.add('ring','ring-blue-400'); } });
    });
    window.addEventListener('mouseup', ()=>{ if (rectEl){ rectEl.remove(); rectEl=null; } start=null; });
    this._marqueeOverlay = overlay;
  };

  Graph.prototype.getSelection = function(){ return this.nodes.filter(n => n.selected); };
}

function installFrames(Graph){
  if (Graph.prototype.__hasFrames) return;
  Graph.prototype.__hasFrames = true;

  Graph.prototype.createFrame = function({x=80,y=80,w=300,h=180,label='Frame'}={}){
    const el = document.createElement('div');
    el.className = 'frame absolute rounded-xl border border-slate-600/70 bg-slate-800/60 text-slate-100';
    Object.assign(el.style, { left:x+'px', top:y+'px', width:w+'px', height:h+'px' });
    const head = document.createElement('div');
    head.className = 'px-3 py-1 text-xs font-semibold bg-[#7a1b2c] rounded-t-xl cursor-move select-none';
    head.textContent = label;
    el.appendChild(head);
    const body = document.createElement('div');
    body.className = 'p-2 text-[11px] text-slate-300 italic';
    body.textContent = 'comment…';
    el.appendChild(body);

    head.addEventListener('mousedown', (e)=>{
      if (e.button!==0) return;
      e.preventDefault();
      const start = { mx:e.clientX, my:e.clientY, x, y, s:this.getScale ? this.getScale():1 };
      const onMove = (ev)=>{ const dx=(ev.clientX-start.mx)/start.s, dy=(ev.clientY-start.my)/start.s;
        x = start.x + dx; y = start.y + dy; el.style.left=x+'px'; el.style.top=y+'px'; };
      const onUp = ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    const area = this.cfg?.content || this.cfg?.area || document.querySelector('#node-area');
    (area||document.body).appendChild(el);

    const frameObj = { el, x, y, w, h, label, nodes: [] };
    this.frames = this.frames || [];
    this.frames.push(frameObj);
    return frameObj;
  };
}

try {
  const _tmp = createGraph({});
  const GraphCtor = _tmp.constructor;
  _tmp.clear?.();
  installSelection(GraphCtor);
  installFrames(GraphCtor);
} catch(e) {
  console.warn('[visual/enhance] patch skipped:', e);
}
