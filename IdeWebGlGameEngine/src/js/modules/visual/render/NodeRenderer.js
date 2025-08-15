// ===== HELPERS =====
function makePinDot(colorHex) {
  const dot = document.createElement('span');
  Object.assign(dot.style, { display:'inline-block', width:'10px', height:'10px', borderRadius:'50%', cursor:'crosshair', background: colorHex || '#94a3b8' });
  return dot;
}
function vectorWidget() {
  const wrap = document.createElement('div');
  ['X','Y','Z'].forEach(axis => {
    const n = document.createElement('input');
    n.type='number'; n.step='0.01'; n.value='0.00';
    n.className='w-14 mx-1 text-xs bg-slate-700 rounded px-1';
    n.style.margin = '0 4px';
    wrap.appendChild(n);
  });
  return wrap;
}
function contextMenuForNode(node, graph) {
  const menu = document.createElement('div');
  menu.style.cssText = `position:fixed; z-index:10000; min-width:160px; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:8px; padding:6px; box-shadow:0 8px 24px rgba(0,0,0,.5); font-size:12px;`;
  const add = (label, fn) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'width:100%; text-align:left; padding:6px 8px; border:0; background:transparent; color:inherit; border-radius:6px; cursor:pointer;';
    b.onmouseenter = () => (b.style.background = '#1e293b');
    b.onmouseleave = () => (b.style.background = 'transparent');
    b.onclick = () => { fn(); menu.remove(); };
    menu.appendChild(b);
  };
  add('Disconnect ports', () => {
    node.inputs.forEach(p => { if (p.link) { const l = p.link; p.link = null; graph.links = graph.links.filter(x => x !== l); l.pathEl?.remove?.(); } });
    node.outputs.forEach(p => { p.links.forEach(l => l.pathEl?.remove?.()); p.links = []; });
    graph.redrawWires?.();
  });
  add('Delete node', () => graph.deleteNode(node));
  document.body.appendChild(menu);
  const api = { show(x,y){ menu.style.left=x+'px'; menu.style.top=y+'px'; }, remove(){ menu.remove(); } };
  document.addEventListener('click', () => api.remove(), { once:true });
  return api;
}
export function controlForPort(port, graph) {
  if (port.kind !== 'field') return null;
  const def = port.meta;
  let el;
  switch (def.ui) {
    case 'checkbox': el = document.createElement('input'); el.type='checkbox'; el.checked=!!def.default; break;
    case 'number':   el = document.createElement('input'); el.type='number'; el.step=def.step ?? (def.type==='int'?'1':'0.01'); el.value = def.default ?? 0; break;
    case 'text':     el = document.createElement('input'); el.type='text'; el.value = def.default ?? ''; break;
    case 'dropdown':
      el = document.createElement('select');
      ['PlayerCapsule','Camera','SkyDome','Track_A01','WaterVolume'].forEach(name=>{
        const opt=document.createElement('option'); opt.value=name; opt.textContent=name; el.appendChild(opt);
      });
      break;
    case 'vector':   el = vectorWidget(); break;
    default: return null;
  }
  el.classList?.add('text-xs','bg-slate-700','rounded','px-2','py-1');
  if (graph.isConnected?.(port)) { el.disabled = true; el.title='Overridden by pin'; }
  return el;
}

export function renderNode(container, node, graph) {
  const spec = node.spec;
  const card = document.createElement('div');
  card.className = 'node rounded-xl bg-slate-800 text-slate-100 shadow-lg select-none';
  card.dataset.nodeId = String(node.uid);
  Object.assign(card.style, { position:'absolute', left:`${node.x}px`, top:`${node.y}px`, minWidth:'240px' });

  const header = document.createElement('div');
  header.className='px-3 py-2 rounded-t-xl font-semibold text-sm';
  header.style.background='#7a1b2c';
  header.textContent=spec.title;
  header.style.cursor = 'move';
  card.appendChild(header);

  const body = document.createElement('div');
  body.className='px-3 py-2 grid grid-cols-1 gap-2';
  card.appendChild(body);

  (spec.controls||[]).forEach(ctrl=>{
    const row=document.createElement('div'); row.className='flex items-center justify-between gap-2';
    const label=document.createElement('label'); label.className='text-xs'; label.textContent=ctrl.label;
    const input=document.createElement('input'); input.type = ctrl.type==='checkbox'?'checkbox':'text';
    if (ctrl.type==='checkbox') input.checked = !!ctrl.default;
    input.className='text-xs bg-slate-700 rounded px-2 py-1';
    row.append(label, input); body.appendChild(row);
    node.controls.set(ctrl.key, input);
  });

  node.inputs.forEach((port, idx)=>{
    const row=document.createElement('div'); row.className='flex items-center gap-2';
    const dot=makePinDot(port.color); port.el = dot; dot.dataset.side='in'; dot.dataset.index=idx; dot.dataset.uid = node.uid;
    const label=document.createElement('span'); label.className='text-xs grow'; label.textContent=port.name;
    row.append(dot, label);
    const ctrl = controlForPort(port, graph); if (ctrl){ row.appendChild(ctrl); node.controls.set(port.name, ctrl); }
    body.appendChild(row);
  });

  node.outputs.forEach((port, idx)=>{
    const row=document.createElement('div'); row.className='flex items-center justify-between';
    const label=document.createElement('span'); label.className='text-xs'; label.textContent=port.name;
    const dot=makePinDot(port.color); port.el = dot; dot.dataset.side='out'; dot.dataset.index=idx; dot.dataset.uid = node.uid;
    row.append(label, dot);
    body.appendChild(row);
  });

  // drag node
  header.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const start = { mx: e.clientX, my: e.clientY, x: node.x, y: node.y, s: graph.getScale ? graph.getScale() : 1 };
    const onMove = (ev) => {
      const dx = (ev.clientX - start.mx) / start.s;
      const dy = (ev.clientY - start.my) / start.s;
      node.x = start.x + dx; node.y = start.y + dy;
      card.style.left = `${node.x}px`; card.style.top = `${node.y}px`;
      graph.redrawWires?.();
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  });

  function getPortFromEvent(ev) {
    const t = ev.target;
    if (!t?.dataset?.side) return null;
    const uid = +t.dataset.uid, idx = +t.dataset.index;
    const nodeHit = graph.getNodeByUid?.(uid);
    if (!nodeHit) return null;
    return t.dataset.side === 'out' ? nodeHit.outputs[idx] : nodeHit.inputs[idx];
  }

  card.addEventListener('mousedown', (e) => {
    const p = getPortFromEvent(e);
    if (!p || e.button!==0) return;
    e.stopPropagation(); e.preventDefault();
    graph.startPreview?.(p);
  });

  window.addEventListener('mousemove', (e) => {
    if (!graph.preview) return;
    const t = document.elementFromPoint(e.clientX, e.clientY);
    let over = null;
    if (t?.dataset?.side) {
      const nodeHit = graph.getNodeByUid?.(+t.dataset.uid);
      if (nodeHit) over = t.dataset.side==='out' ? nodeHit.outputs[+t.dataset.index] : nodeHit.inputs[+t.dataset.index];
    }
    graph.updatePreview?.(e.clientX, e.clientY, over);
  });

  window.addEventListener('mouseup', (e) => {
    if (!graph.preview) return;
    let over = null;
    const t = document.elementFromPoint(e.clientX, e.clientY);
    if (t?.dataset?.side) {
      const nodeHit = graph.getNodeByUid?.(+t.dataset.uid);
      if (nodeHit) over = t.dataset.side==='out' ? nodeHit.outputs[+t.dataset.index] : nodeHit.inputs[+t.dataset.index];
    }
    graph.finishPreview?.(over);
  });

  // menu contextuel node
  card.addEventListener('contextmenu', (e) => {
    e.preventDefault(); e.stopPropagation();
    const m = contextMenuForNode(node, graph);
    m.show(e.clientX, e.clientY);
  });

  container.appendChild(card);
  node.view = card;
  return card;
}
