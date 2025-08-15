/* =========================================================================
   src/js/modules/visual/context.js — menu clic droit IDE
   ========================================================================= */

function buildMenu(items){
  const menu = document.createElement('div');
  menu.style.cssText = `
    position:fixed; z-index:10000; min-width:200px;
    background:#0f172a; color:#e2e8f0; border:1px solid #334155;
    border-radius:8px; padding:6px; box-shadow:0 8px 24px rgba(0,0,0,.5); font-size:12px;`;
  items.forEach(({label, action, disabled})=>{
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = !!disabled;
    b.style.cssText = `
      width:100%; text-align:left; padding:6px 8px; border:0;
      background:transparent; color:inherit; border-radius:6px; cursor:pointer; opacity:${disabled?0.5:1};`;
    b.onmouseenter=()=>{ if(!b.disabled) b.style.background='#1e293b'; };
    b.onmouseleave=()=>{ b.style.background='transparent'; };
    b.onclick = ()=>{ if(!disabled) action(); close(); };
    menu.appendChild(b);
  });
  function close(){ menu.remove(); document.removeEventListener('click', close); }
  document.body.appendChild(menu);
  return { show(x,y){ menu.style.left=x+'px'; menu.style.top=y+'px'; }, close };
}

export function attachContextMenu(areaEl, graph){
  // menu sur la zone vide
  areaEl.addEventListener('contextmenu', (e)=>{
    // si un node est ciblé, laisse l'autre handler gérer
    if (e.target.closest?.('.node')) return;
    e.preventDefault();
    const m = buildMenu([
      { label:'Add Frame', action:()=> graph.createFrame?.({ x:100, y:100, w:320, h:200, label:'Frame'}) },
      { label:'Clear All Nodes', action:()=> graph.clear?.() },
      { label:'Reset Zoom', action:()=> graph.setScale?.(1) },
    ]);
    m.show(e.clientX, e.clientY);
  });

  // menu sur un node
  areaEl.addEventListener('contextmenu', (e)=>{
    const card = e.target.closest?.('.node');
    if (!card) return;
    e.preventDefault(); e.stopPropagation();
    const uid = +card.dataset.nodeId;
    const node = graph.getNodeByUid?.(uid);
    if (!node) return;

    const m = buildMenu([
      { label:'Disconnect Ports', action:()=>{
          node.inputs?.forEach(p=>{ if (p.link){ const l=p.link; p.link=null; graph.links = (graph.links||[]).filter(x=>x!==l); l.pathEl?.remove?.(); }});
          node.outputs?.forEach(p=>{ (p.links||[]).forEach(l=> l.pathEl?.remove?.()); p.links=[]; });
          graph.redrawWires?.();
        }},
      { label:'Delete Node', action:()=> graph.deleteNode?.(node) },
    ]);
    m.show(e.clientX, e.clientY);
  });
}
