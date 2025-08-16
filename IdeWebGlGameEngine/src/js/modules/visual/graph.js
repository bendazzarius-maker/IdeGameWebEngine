import { $, log } from '../../core/dom.js';
import { Project } from '../../core/project.js';
import { NodeCatalog, portColor, PinKinds } from './catalog.js';

export function createGraph({area, viewport, wireSvg, libContainer, zoomLabel, nameInput, assignSelect, scriptList}){
  const VS = {
    seq:1, nodes:new Map(), edges:[],
    area, viewport, wireSvg, zoom:1, pan:{x:0,y:0},
    connecting:null, _ghostPath:null, _ghostFrom:null,
    selected:null, hoverPin:null,
    cutting:null,
    rerouting:null
  };

  /* ---------- compatibilité de types ---------- */
  function isCompatible(fromType, toInfo){
    if (toInfo.acceptAny) return true;           // wildcard
    if (fromType === toInfo.type) return true;   // exact
    return false;
  }
  function toPortInfo(pinEl){
    const nodeId = pinEl.dataset.nodeId;
    const portIndex = parseInt(pinEl.dataset.portIndex);
    const type = pinEl.dataset.type;
    const dir = pinEl.dataset.dir;
    const acceptAny = (dir==='in' && (type==='any'));
    return { nodeId, portIndex, type, el:pinEl, dir, acceptAny };
  }

  /* ---------- coords & dessin ---------- */
  const screenToContent=(x,y)=>{ const r=area.getBoundingClientRect(); return {x:(x-r.left - VS.pan.x)/VS.zoom, y:(y-r.top - VS.pan.y)/VS.zoom}; };
  const portCenterSvg=(pin)=>{ const pr=pin.getBoundingClientRect(); const sr=wireSvg.getBoundingClientRect(); return {x:pr.left+pr.width/2-sr.left, y:pr.top+pr.height/2-sr.top}; };
  const clientToSvg=(x,y)=>{ const r=wireSvg.getBoundingClientRect(); return {x:x-r.left, y:y-r.top}; };
  const cubicPath=(x1,y1,x2,y2)=>{ const d=Math.max(40,Math.abs(x2-x1)*0.5); return `M ${x1},${y1} C ${x1+d},${y1} ${x2-d},${y2} ${x2},${y2}`; };
  function setViewportTransform(){ viewport.style.transform=`translate(${VS.pan.x}px,${VS.pan.y}px) scale(${VS.zoom})`; zoomLabel.textContent=Math.round(VS.zoom*100)+'%'; drawWires(); }

  /* ---------- hit test + snap ---------- */
  function findNearestInputPort(clientX, clientY, radiusPx=18){
    const pins = $$('.port[data-dir="in"]', viewport);
    let best=null, bestD2=radiusPx*radiusPx;
    for (const p of pins){
      const r=p.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const dx=cx-clientX, dy=cy-clientY, d2=dx*dx+dy*dy;
      if (d2<=bestD2){ bestD2=d2; best=p; }
    }
    return best ? toPortInfo(best) : null;
  }
  function hitTestPortAt(clientX, clientY){
    const prev=wireSvg.style.pointerEvents; wireSvg.style.pointerEvents='none';
    const el=document.elementFromPoint(clientX,clientY);
    wireSvg.style.pointerEvents=prev||'';
    const direct=el?.closest?.('.port');
    if (direct) return toPortInfo(direct);
    return findNearestInputPort(clientX, clientY, 24);
  }

  /* ---------- halo pendant le drag ---------- */
  function setHoverPin(pinEl){
    if (VS.hoverPin === pinEl) return;
    clearHoverPin();
    VS.hoverPin = pinEl || null;
    if (VS.hoverPin){
      VS.hoverPin.style.outline = '2px solid rgba(255,255,255,.65)';
      VS.hoverPin.style.outlineOffset = '2px';
    }
  }
  function clearHoverPin(){
    if (!VS.hoverPin) return;
    VS.hoverPin.style.outline = '';
    VS.hoverPin.style.outlineOffset = '';
    VS.hoverPin = null;
  }

  /* ---------- création ports/nœuds ---------- */
  function createPort(pinDef,dir,nodeId,portIndex){
    const {name,type,kind=PinKinds.DATA,picker} = pinDef;
    const wrap=document.createElement('div'); wrap.className='flex items-center gap-2';
    const label=document.createElement('span'); label.textContent=name; label.className='text-slate-300';
    const pin=document.createElement('div'); pin.className='port';
    if(kind===PinKinds.FIELD) pin.classList.add('field');
    pin.dataset.type=type; pin.dataset.dir=dir; pin.dataset.nodeId=nodeId; pin.dataset.portIndex=portIndex; pin.dataset.kind=kind;
    pin.style.background=portColor(type);

    let field=null;
    if(dir==='in'){
      wrap.append(pin,label);
      if(kind===PinKinds.FIELD){
        if(picker==='object' || type==='object'){
          const sel=document.createElement('select');
          sel.className='bg-panel text-xs rounded px-1 py-0.5';
          (Project.objects||[]).forEach(o=>{ const opt=document.createElement('option'); opt.value=o; opt.textContent=o; sel.appendChild(opt); });
          wrap.appendChild(sel); field=sel;
        }else if(type==='bool'){
          const chk=document.createElement('input'); chk.type='checkbox';
          wrap.appendChild(chk); field=chk;
        }else if(type==='int' || type==='float'){
          const num=document.createElement('input'); num.type='number';
          num.className='w-16 bg-panel rounded px-1 py-0.5';
          wrap.appendChild(num); field=num;
        }else{
          const txt=document.createElement('input'); txt.type='text';
          txt.className='w-24 bg-panel rounded px-1 py-0.5';
          wrap.appendChild(txt); field=txt;
        }
      }
    }else{
      if(kind===PinKinds.FIELD){
        if(picker==='object' || type==='object'){
          const sel=document.createElement('select');
          sel.className='bg-panel text-xs rounded px-1 py-0.5';
          (Project.objects||[]).forEach(o=>{ const opt=document.createElement('option'); opt.value=o; opt.textContent=o; sel.appendChild(opt); });
          wrap.appendChild(sel); field=sel;
        }else if(type==='bool'){
          const chk=document.createElement('input'); chk.type='checkbox';
          wrap.appendChild(chk); field=chk;
        }else if(type==='int' || type==='float'){
          const num=document.createElement('input'); num.type='number';
          num.className='w-16 bg-panel rounded px-1 py-0.5';
          wrap.appendChild(num); field=num;
        }else{
          const txt=document.createElement('input'); txt.type='text';
          txt.className='w-24 bg-panel rounded px-1 py-0.5';
          wrap.appendChild(txt); field=txt;
        }
        wrap.append(label,pin);
      }else{
        wrap.append(label,pin);
      }
    }

    pin.addEventListener('pointerdown',(e)=>{
      if(e.button!==0) return;
      if(dir==='out'){
        VS.connecting={nodeId,portIndex,type,el:pin,dir};
        startGhostWire(pin,e.clientX,e.clientY);
        pin.setPointerCapture(e.pointerId);
      }
    });
    pin.addEventListener('pointerup',(e)=>{
      if(!VS.connecting) return;
      if (dir === 'in') finishConnectAtPointer(e.clientX,e.clientY,pin);
      else              finishConnectAtPointer(e.clientX,e.clientY,null);
    });

    return {wrap, el:pin, field};
  }

  function createControl(ctrl){
    const wrap=document.createElement('label');
    wrap.className='flex items-center gap-2 text-xs text-slate-300';
    const span=document.createElement('span'); span.textContent=ctrl.key; wrap.appendChild(span);
    let el;
    if(ctrl.type==='select'){
      el=document.createElement('select');
      el.className='bg-panel text-xs rounded px-1 py-0.5';
      (ctrl.options||[]).forEach(opt=>{const o=document.createElement('option'); o.value=opt; o.textContent=opt; el.appendChild(o);});
      el.value=ctrl.default??ctrl.options?.[0]??'';
    }else if(ctrl.type==='number'){
      el=document.createElement('input'); el.type='number'; el.className='w-16 bg-panel rounded px-1 py-0.5';
      if(ctrl.step!=null) el.step=ctrl.step; if(ctrl.min!=null) el.min=ctrl.min; if(ctrl.max!=null) el.max=ctrl.max; if(ctrl.default!=null) el.value=ctrl.default;
    }else if(ctrl.type==='text'){
      el=document.createElement('input'); el.type='text'; el.className='w-24 bg-panel rounded px-1 py-0.5'; if(ctrl.default!=null) el.value=ctrl.default;
    }else if(ctrl.type==='checkbox'){
      el=document.createElement('input'); el.type='checkbox'; el.className=''; el.checked=!!ctrl.default;
    }
    if(el) wrap.appendChild(el);
    return {wrap, el};
  }

  function addNode(def,x=40,y=40){
    const id=`n${VS.seq++}`;
    const el=document.createElement('div');
    el.className='node absolute w-64 rounded-xl bg-panel/70 border border-white/10 shadow-soft';
    el.style.left=x+'px'; el.style.top=y+'px';
    el.dataset.nodeId = id;
    el.innerHTML=`
      <div class="header flex items-center justify-between px-3 py-2 border-b border-white/5 rounded-t-xl bg-white/5">
        <span class="title text-xs text-slate-300">${def.title||def.type}</span>
        <span class="id text-[10px] text-slate-500">#${id}</span>
      </div>
      <div class="controls flex flex-col gap-2 px-3 py-2 text-xs"></div>
      <div class="io grid grid-cols-2 gap-2 p-2 text-xs"></div>
      <div class="meta px-3 pb-2 text-[10px] text-slate-500">${def.type}</div>
    `;
    const ctrlZone=el.querySelector('.controls');
    const io=el.querySelector('.io');
    const colL=document.createElement('div'); colL.className='space-y-2';
    const colR=document.createElement('div'); colR.className='space-y-2';

    // Les nœuds d'événements (On Init, On Update, etc.) ne possèdent pas d'entrée "Update".
    // L'ancien test ne reconnaissait que les anciens noms "OnInit"/"EveryFrame" et ignorait
    // les nouveaux identifiants issus du catalogue statique (ex: "events.on_update").
    // On considère désormais qu'un nœud est un événement dès que son type commence par
    // "events." afin de couvrir tout le groupe.
    const isEvent = typeof def.type === 'string' && def.type.startsWith('events.');
    const skipUpdate = def.behavior && def.behavior.passive;
    const finalInputs=[]; if(!isEvent && !skipUpdate && !(def.inputs||[]).some(p=>p.name==='Update')) finalInputs.push({name:'Update',type:'bool'});
    (def.inputs||[]).forEach(p=>finalInputs.push(p));

    const inputs = finalInputs.map((p,i)=>{ const {wrap,el:pin,field}=createPort(p,'in',id,i); colL.appendChild(wrap); return {name:p.name,type:p.type,kind:p.kind,el:pin,field}; });
    const outputs= (def.outputs||[]).map((p,i)=>{ const {wrap,el:pin,field}=createPort(p,'out',id,i); colR.appendChild(wrap); return {name:p.name,type:p.type,kind:p.kind,el:pin,field}; });
    io.append(colL,colR);
    const controls=(def.controls||[]).map(c=>{ const {wrap,el:ctl}=createControl(c); ctrlZone.appendChild(wrap); return {key:c.key,el:ctl}; });
    if(controls.length===0) ctrlZone.style.display='none';
    viewport.appendChild(el);

    el.addEventListener('pointerdown',(e)=>{
      const header=e.target.closest('.header'); if(!header) return;
      selectNode(id);
      let drag=true; el.setPointerCapture(e.pointerId);
      const c=screenToContent(e.clientX,e.clientY);
      const offX=c.x-parseFloat(el.style.left||'0'); const offY=c.y-parseFloat(el.style.top||'0');
      const onMove=(ev)=>{ if(!drag) return; const d=screenToContent(ev.clientX,ev.clientY); el.style.left=(d.x-offX)+'px'; el.style.top=(d.y-offY)+'px'; drawWires(); };
      const onUp=()=>{ drag=false; el.removeEventListener('pointermove',onMove); el.removeEventListener('pointerup',onUp); };
      el.addEventListener('pointermove',onMove); el.addEventListener('pointerup',onUp);
    });

    const node={id,def,el,inputs,outputs,controls};
    VS.nodes.set(id,node);
    return id;
  }

  function addRerouteNode(x,y,type){
    const id=`n${VS.seq++}`;
    const el=document.createElement('div');
    el.className='node reroute absolute rounded-full bg-panel border border-white/10';
    el.style.left=(x-6)+'px'; el.style.top=(y-6)+'px';
    el.style.width='12px'; el.style.height='12px';
    el.dataset.nodeId=id;

    const inPin=document.createElement('div');
    inPin.className='port';
    inPin.dataset.type=type; inPin.dataset.dir='in';
    inPin.dataset.nodeId=id; inPin.dataset.portIndex='0';
    inPin.style.background=portColor(type);
    inPin.style.position='absolute'; inPin.style.left='-6px';
    inPin.style.top='50%'; inPin.style.transform='translate(-50%,-50%)';

    const outPin=document.createElement('div');
    outPin.className='port';
    outPin.dataset.type=type; outPin.dataset.dir='out';
    outPin.dataset.nodeId=id; outPin.dataset.portIndex='0';
    outPin.style.background=portColor(type);
    outPin.style.position='absolute'; outPin.style.right='-6px';
    outPin.style.top='50%'; outPin.style.transform='translate(50%,-50%)';

    el.append(inPin,outPin);
    viewport.appendChild(el);
    // enable connecting from/to reroute pins
    function attachReroutePortEvents(pin, dir){
      pin.addEventListener('pointerdown',(e)=>{
        if(e.button!==0) return; e.stopPropagation(); e.preventDefault();
        if(dir==='out'){
          VS.connecting = { nodeId: pin.dataset.nodeId, portIndex: parseInt(pin.dataset.portIndex), type: pin.dataset.type, el: pin, dir };
          startGhostWire(pin, e.clientX, e.clientY);
          pin.setPointerCapture(e.pointerId);
        }
      });
      pin.addEventListener('pointerup',(e)=>{
        e.stopPropagation(); e.preventDefault();
        if(!VS.connecting) return;
        if(dir==='in')  finishConnectAtPointer(e.clientX, e.clientY, pin);
        else            finishConnectAtPointer(e.clientX, e.clientY, null);
      });
    }
    attachReroutePortEvents(inPin,'in');
    attachReroutePortEvents(outPin,'out');
    el.addEventListener('pointerdown',(e)=>{
      if(e.button!==0) return;
      selectNode(id);
      el.setPointerCapture(e.pointerId);
      const c=screenToContent(e.clientX,e.clientY);
      const offX=c.x-parseFloat(el.style.left||'0');
      const offY=c.y-parseFloat(el.style.top||'0');
      const onMove=(ev)=>{ const d=screenToContent(ev.clientX,ev.clientY); el.style.left=(d.x-offX)+'px'; el.style.top=(d.y-offY)+'px'; drawWires(); };
      const onUp=()=>{ el.removeEventListener('pointermove',onMove); };
      el.addEventListener('pointermove',onMove);
      el.addEventListener('pointerup',onUp,{once:true});
    });

    const node={id,def:{type:'Reroute'},el,
      inputs:[{name:'',type,el:inPin}], outputs:[{name:'',type,el:outPin}], controls:[]};
    VS.nodes.set(id,node);
    return id;
  }

  function addRerouteOnEdge(idx, clientX, clientY){
    const edge=VS.edges[idx]; if(!edge) return;
    const nA=VS.nodes.get(edge.from.id), nB=VS.nodes.get(edge.to.id);
    const outPin=nA?.outputs[edge.from.port]?.el;
    const inPin=nB?.inputs[edge.to.port]?.el;
    if(!outPin||!inPin) return;
    VS.edges.splice(idx,1);
    const c=screenToContent(clientX,clientY);
    const id=addRerouteNode(c.x,c.y,edge.type);
    const reroute=VS.nodes.get(id);
    addEdgeValidated(toPortInfo(outPin), toPortInfo(reroute.inputs[0].el));
    addEdgeValidated(toPortInfo(reroute.outputs[0].el), toPortInfo(inPin));
    drawWires();
  }

  function selectNode(id){
    VS.selected = id;
    const el = VS.nodes.get(id)?.el;
    $('#viewport')?.querySelectorAll('.node').forEach(n=>n.classList.toggle('selected', n===el));
    const sel = $('#selection'); if (sel) sel.textContent = el ? el.querySelector('.title')?.textContent + ' (#'+id+')' : '—';
  }

  /* ---------- wires : render (valide / mismatch) ---------- */
  function drawOneMismatch(a, b){
    const pY=document.createElementNS('http://www.w3.org/2000/svg','path');
    pY.setAttribute('fill','none'); pY.setAttribute('stroke','#facc15'); pY.setAttribute('stroke-width','3');
    pY.setAttribute('stroke-dasharray','10 6'); pY.setAttribute('d',cubicPath(a.x,a.y,b.x,b.y));

    const pK=document.createElementNS('http://www.w3.org/2000/svg','path');
    pK.setAttribute('fill','none'); pK.setAttribute('stroke','#0b0f17'); pK.setAttribute('stroke-width','1.5');
    pK.setAttribute('stroke-dasharray','10 6'); pK.setAttribute('d',cubicPath(a.x,a.y,b.x,b.y));
    pK.setAttribute('stroke-dashoffset','8');

    const midX=(a.x+b.x)/2, midY=(a.y+b.y)/2;
    const x1=document.createElementNS('http://www.w3.org/2000/svg','line');
    x1.setAttribute('x1',midX-6); x1.setAttribute('y1',midY-6);
    x1.setAttribute('x2',midX+6); x1.setAttribute('y2',midY+6);
    x1.setAttribute('stroke','#ef4444'); x1.setAttribute('stroke-width','3');

    const x2=document.createElementNS('http://www.w3.org/2000/svg','line');
    x2.setAttribute('x1',midX-6); x2.setAttribute('y1',midY+6);
    x2.setAttribute('x2',midX+6); x2.setAttribute('y2',midY-6);
    x2.setAttribute('stroke','#ef4444'); x2.setAttribute('stroke-width','3');

    wireSvg.append(pY,pK,x1,x2);
  }

  function drawWires(){
    wireSvg.innerHTML='';
    VS.edges.forEach((e,idx)=>{
      const nA=VS.nodes.get(e.from.id), nB=VS.nodes.get(e.to.id); if(!nA||!nB) return;
      const pA=nA.outputs[e.from.port]?.el, pB=nB.inputs[e.to.port]?.el; if(!pA||!pB) return;
      const a=portCenterSvg(pA), b=portCenterSvg(pB);
      if (e.invalid){
        drawOneMismatch(a,b);
      }else{
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');
        path.classList.add('edge'); path.dataset.index=idx;
        path.setAttribute('fill','none'); path.setAttribute('stroke', e.color||portColor(e.type)); path.setAttribute('stroke-width','2.5');
        path.setAttribute('d', cubicPath(a.x,a.y,b.x,b.y));
        path.addEventListener('pointerdown',(ev)=>{
          if(ev.button!==0) return;
          if(ev.shiftKey){ ev.preventDefault(); addRerouteOnEdge(parseInt(path.dataset.index), ev.clientX, ev.clientY); }
        });
        wireSvg.appendChild(path);
      }
    });
    if(VS._ghostPath) wireSvg.appendChild(VS._ghostPath);
  }

  /* ---------- ghost wire ---------- */
  function startGhostWire(pin, cx, cy){
    const a=portCenterSvg(pin);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.classList.add('ghost-wire'); p.setAttribute('fill','none'); p.setAttribute('stroke', portColor(pin.dataset.type)); p.setAttribute('stroke-width','2');
    const b=clientToSvg(cx,cy);
    p.setAttribute('d', cubicPath(a.x,a.y,b.x,b.y));
    VS._ghostFrom=a; VS._ghostPath=p; drawWires();
  }
  function updateGhostWire(cx,cy){
    if(!VS._ghostPath||!VS._ghostFrom) return;
    const a=VS._ghostFrom, b=clientToSvg(cx,cy);
    VS._ghostPath.setAttribute('d', cubicPath(a.x,a.y,b.x,b.y));
    const near = findNearestInputPort(cx, cy, 18);
    setHoverPin(near?.el || null);
  }
  function endGhostWire(){ VS._ghostFrom=null; VS._ghostPath=null; clearHoverPin(); drawWires(); }

  /* ---------- coupe de câbles ---------- */
  function segmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy){
    const ccw=(px,py,qx,qy,rx,ry)=> (ry-py)*(qx-px) > (qy-py)*(rx-px);
    return (ccw(ax,ay,cx,cy,dx,dy) !== ccw(bx,by,cx,cy,dx,dy)) && (ccw(ax,ay,bx,by,cx,cy) !== ccw(ax,ay,bx,by,dx,dy));
  }
  function lineIntersection(a,b,c,d){
    const A1=b.y-a.y, B1=a.x-b.x, C1=A1*a.x+B1*a.y;
    const A2=d.y-c.y, B2=c.x-d.x, C2=A2*c.x+B2*c.y;
    const denom=A1*B2-A2*B1;
    if(!denom) return {x:(c.x+d.x)/2, y:(c.y+d.y)/2};
    const x=(B2*C1-B1*C2)/denom;
    const y=(A1*C2-A2*C1)/denom;
    return {x,y};
  }
  function cutEdgesBySegment(a,b){
    VS.edges = VS.edges.filter(e=>{
      const nA=VS.nodes.get(e.from.id), nB=VS.nodes.get(e.to.id);
      const pA=nA?.outputs[e.from.port]?.el, pB=nB?.inputs[e.to.port]?.el;
      if(!pA||!pB) return false;
      const s=portCenterSvg(pA), t=portCenterSvg(pB);
      return !segmentsIntersect(a.x,a.y,b.x,b.y,s.x,s.y,t.x,t.y);
    });
    drawWires();
  }
  function startCut(cx,cy){
    const p=clientToSvg(cx,cy);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.classList.add('ghost-wire');
    line.setAttribute('stroke','#f87171'); line.setAttribute('stroke-width','2');
    line.setAttribute('x1',p.x); line.setAttribute('y1',p.y);
    line.setAttribute('x2',p.x); line.setAttribute('y2',p.y);
    VS.cutting={start:p,end:{...p},el:line};
    wireSvg.appendChild(line);
  }
  function updateCut(cx,cy){
    if(!VS.cutting) return; const p=clientToSvg(cx,cy); VS.cutting.end=p;
    VS.cutting.el.setAttribute('x2',p.x); VS.cutting.el.setAttribute('y2',p.y);
  }
  function finishCut(){
    if(!VS.cutting) return; const {start,end,el}=VS.cutting; el.remove(); VS.cutting=null; cutEdgesBySegment(start,end);
  }

  function rerouteEdgesBySegment(a,b){
    const hits=[];
    VS.edges.forEach((e,idx)=>{
      const nA=VS.nodes.get(e.from.id), nB=VS.nodes.get(e.to.id);
      const pA=nA?.outputs[e.from.port]?.el, pB=nB?.inputs[e.to.port]?.el;
      if(!pA||!pB) return;
      const s=portCenterSvg(pA), t=portCenterSvg(pB);
      if(segmentsIntersect(a.x,a.y,b.x,b.y,s.x,s.y,t.x,t.y)){
        const pt=lineIntersection(a,b,s,t);
        hits.push({idx,pt});
      }
    });
    hits.sort((x,y)=>y.idx-x.idx);
    const r=wireSvg.getBoundingClientRect();
    hits.forEach(h=> addRerouteOnEdge(h.idx, h.pt.x+r.left, h.pt.y+r.top));
  }
  function startReroute(cx,cy){
    const p=clientToSvg(cx,cy);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.classList.add('ghost-wire');
    line.setAttribute('stroke','#38bdf8'); line.setAttribute('stroke-width','2');
    line.setAttribute('x1',p.x); line.setAttribute('y1',p.y);
    line.setAttribute('x2',p.x); line.setAttribute('y2',p.y);
    VS.rerouting={start:p,end:{...p},el:line};
    wireSvg.appendChild(line);
  }
  function updateReroute(cx,cy){
    if(!VS.rerouting) return; const p=clientToSvg(cx,cy); VS.rerouting.end=p;
    VS.rerouting.el.setAttribute('x2',p.x); VS.rerouting.el.setAttribute('y2',p.y);
  }
  function finishReroute(){
    if(!VS.rerouting) return; const {start,end,el}=VS.rerouting; el.remove(); VS.rerouting=null; rerouteEdgesBySegment(start,end); drawWires();
  }

  /* ---------- ajout edge avec validation ---------- */
  function addEdgeValidated(fromInfo, toInfo){
    const valid = isCompatible(fromInfo.type, toInfo);
    VS.edges.push({
      from:{id:fromInfo.nodeId, port:fromInfo.portIndex},
      to:{id:toInfo.nodeId,     port:toInfo.portIndex},
      type:fromInfo.type,
      color: valid ? portColor(fromInfo.type) : portColor(fromInfo.type),
      invalid: !valid
    });
  }

  function finishConnectAtPointer(clientX, clientY, explicitEl){
    if(!VS.connecting){ endGhostWire(); return; }

    let target = null;
    if (explicitEl?.classList?.contains('port')) target = toPortInfo(explicitEl);
    else target = hitTestPortAt(clientX, clientY) || findNearestInputPort(clientX, clientY, 24);

    if(!target){ endGhostWire(); VS.connecting=null; return; }

    let from=VS.connecting, to=target;
    if(from.dir==='in' && to.dir==='out'){ const t=from; from=to; to=t; }
    if(!(from.dir==='out' && to.dir==='in')){ endGhostWire(); VS.connecting=null; return; }

    addEdgeValidated(toPortInfo(from.el), to);
    const ok = !VS.edges[VS.edges.length-1].invalid;
    log(ok
      ? `Connected ${from.nodeId}.${from.portIndex} → ${to.nodeId}.${to.portIndex} (${from.type})`
      : `Type mismatch: ${from.type} → ${to.acceptAny?'any':to.type} (visual warning shown)`
    );
    endGhostWire(); VS.connecting=null; drawWires();
  }

  /* ---------- global events pour ghost ---------- */
  document.addEventListener('pointermove',(e)=>{ if(VS._ghostPath) updateGhostWire(e.clientX,e.clientY); if(VS.cutting) updateCut(e.clientX,e.clientY); if(VS.rerouting) updateReroute(e.clientX,e.clientY); });
  document.addEventListener('pointerup',   (e)=>{ if(VS._ghostPath) finishConnectAtPointer(e.clientX,e.clientY); if(VS.cutting) finishCut(); if(VS.rerouting) finishReroute(); });
  area.addEventListener('pointerdown',(e)=>{ if(e.button===0 && e.shiftKey){ e.preventDefault(); startReroute(e.clientX,e.clientY); } else if(e.button===0 && e.ctrlKey){ e.preventDefault(); startCut(e.clientX,e.clientY); }});

  /* ---------- zoom/pan ---------- */
  area.addEventListener('wheel',(e)=>{
    e.preventDefault();
    const scale=Math.exp(-e.deltaY*0.0015);
    const nx=e.clientX, ny=e.clientY;
    const pre=screenToContent(nx,ny);
    VS.zoom=Math.min(2.5,Math.max(0.25,VS.zoom*scale));
    setViewportTransform();
    const post=screenToContent(nx,ny);
    VS.pan.x += (post.x - pre.x)*VS.zoom; VS.pan.y += (post.y - pre.y)*VS.zoom;
    setViewportTransform();
  }, {passive:false});
  let panning=false, panStart={x:0,y:0}, panBase={x:0,y:0};
  area.addEventListener('pointerdown',(e)=>{ if(e.button===1){ panning=true; area.classList.add('nodemap-panning'); panStart={x:e.clientX,y:e.clientY}; panBase={...VS.pan}; area.setPointerCapture(e.pointerId);} });
  area.addEventListener('pointermove',(e)=>{ if(!panning) return; VS.pan.x=panBase.x+(e.clientX-panStart.x); VS.pan.y=panBase.y+(e.clientY-panStart.y); setViewportTransform(); });
  area.addEventListener('pointerup',()=>{ panning=false; area.classList.remove('nodemap-panning'); });

  /* ---------- library (drag/drop + click) ---------- */
  function buildLibrary(){
    libContainer.innerHTML='';
    for(const group of NodeCatalog){
      const det=document.createElement('details'); det.className='bg-white/5 rounded';
      const sum=document.createElement('summary'); sum.className='px-2 py-1.5 cursor-pointer select-none'; sum.textContent=group.group;
      const ul=document.createElement('ul'); ul.className='p-2 pt-1 text-sm space-y-1';
      for(const item of group.items){
        const btn=document.createElement('button');
        btn.className='w-full text-left px-2 py-1 rounded hover:bg-white/10 border border-white/5';
        btn.textContent=item.title; btn.draggable=true;
        btn.addEventListener('dragstart',(e)=> e.dataTransfer.setData('application/x-node-type', JSON.stringify(item)));
        btn.addEventListener('click',()=>{ const id=addNode(item, 80+Math.random()*120, 80+Math.random()*60); log('Added node: '+item.type+' (#'+id+')'); drawWires(); });
        const li=document.createElement('li'); li.appendChild(btn); ul.appendChild(li);
      }
      det.append(sum,ul); libContainer.appendChild(det);
    }
  }
  area.addEventListener('dragover',(e)=>e.preventDefault());
  area.addEventListener('drop',(e)=>{
    e.preventDefault();
    const data=e.dataTransfer.getData('application/x-node-type');
    if(!data) return;
    const def=JSON.parse(data);
    if (!def || !def.type) {
      console.warn('❌ Node drop ignored — invalid spec:', data);
      return;
    }
    const c=screenToContent(e.clientX,e.clientY);
    const id=addNode(def,c.x,c.y);
    log(`Dropped node: ${def.type} (#${id})`);
    drawWires();
  });

  /* ---------- JSON / assign / (dé)serialisation ---------- */
  function serializeNodes(){ const arr=[]; for(const n of VS.nodes.values()){ arr.push({id:n.id,type:n.def.type,title:n.def.title,x:parseFloat(n.el.style.left||'0'),y:parseFloat(n.el.style.top||'0')}); } return arr; }
  function deserializeNodes(list){ for(const n of list){ const def=NodeCatalog.flatMap(g=>g.items).find(it=>it.type===n.type); if(!def) continue; addNode(def,n.x,n.y);} drawWires(); }
  function setEdges(edges){
    VS.edges=[]; // revalider toutes
    for (const e of (edges||[])){
      const nA=VS.nodes.get(e.from.id), nB=VS.nodes.get(e.to.id);
      if (!nA || !nB) continue;
      const outPin = nA.outputs[e.from.port]?.el;
      const inPin  = nB.inputs [e.to.port]?.el;
      if (!outPin || !inPin) continue;
      const from = toPortInfo(outPin);
      const to   = toPortInfo(inPin);
      addEdgeValidated(from, to);
    }
    drawWires();
  }
  function clearGraph(){ VS.nodes.clear(); VS.edges=[]; viewport.innerHTML=''; drawWires(); }

  function refreshAssignOptions(){ assignSelect.innerHTML=''; for(const o of Project.objects){ const opt=document.createElement('option'); opt.value=o; opt.textContent=o; assignSelect.appendChild(opt);} assignSelect.value=Project.current.assignedTo||Project.objects[0]; }
  function refreshScriptList(){ scriptList.innerHTML=''; Object.keys(Project.scripts).forEach(name=>{ const li=document.createElement('li'); const b=document.createElement('button'); b.className='w-full text-left px-2 py-1 rounded hover:bg-white/10 border border-white/5'; b.textContent=name; b.addEventListener('click',()=>{ nameInput.value=name; assignSelect.value=Project.scripts[name].assignedTo||Project.objects[0]; clearGraph(); deserializeNodes(Project.scripts[name].nodes||[]); setEdges(Project.scripts[name].edges||[]); }); li.appendChild(b); scriptList.appendChild(li); }); }
  function setNameAssign(n,a){ nameInput.value=n; assignSelect.value=a; }

  function saveJSON(){
    const json={ name:Project.name, objects:Project.objects.slice(), scripts:Project.scripts, current:{ name:nameInput.value, assignedTo:assignSelect.value, nodes:serializeNodes(), edges:VS.edges } };
    const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=(json.name||'project')+'.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  /* ---------- API publique ---------- */
  return {
    VS, buildLibrary, addNode, drawWires, clearGraph,
    serializeNodes, deserializeNodes, setEdges,
    refreshAssignOptions, refreshScriptList, setNameAssign,
    saveJSON,
    // édition
    selectNode,
    removeNode(id){ const n=VS.nodes.get(id); if(!n) return; n.el.remove(); VS.nodes.delete(id); VS.edges = VS.edges.filter(e=>e.from.id!==id && e.to.id!==id); drawWires(); },
    duplicateNode(id){ const n=VS.nodes.get(id); if(!n) return; const x=parseFloat(n.el.style.left||'0')+30, y=parseFloat(n.el.style.top||'0')+30; addNode(n.def,x,y); drawWires(); },
    centerOnNode(id){ const n=VS.nodes.get(id); if(!n) return; const r=area.getBoundingClientRect(); const nx=parseFloat(n.el.style.left||'0'); const ny=parseFloat(n.el.style.top||'0'); VS.pan.x=r.width/2-(nx*VS.zoom+64); VS.pan.y=r.height/2-(ny*VS.zoom+40); setViewportTransform(); },
    cutAllEdgesOf(id){ VS.edges = VS.edges.filter(e => e.from.id!==id && e.to.id!==id); drawWires(); },
    setViewportTransform
  };
}
