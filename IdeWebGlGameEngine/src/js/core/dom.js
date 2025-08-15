// [src/js/core/dom.js] (backup)
export const $  = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export const log = (msg) => {
  const el = $('#console'); if(!el) return;
  el.textContent += `\n${msg}`; el.scrollTop = el.scrollHeight;
};

export function makeVSplit(divider, leftPane, rightPane, minLeft=160, minRight=200){
  let dragging=false;
  divider.addEventListener('mousedown', e=>{ dragging=true; document.body.classList.add('dragging'); e.preventDefault(); });
  window.addEventListener('mousemove', e=>{
    if(!dragging) return;
    const total = leftPane.parentElement.clientWidth;
    const rect  = leftPane.parentElement.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(minLeft, Math.min(total-minRight, x));
    leftPane.style.width = x+'px';
  });
  window.addEventListener('mouseup', ()=>{ dragging=false; document.body.classList.remove('dragging'); });
}

export function makeHSplit(divider, appRoot, bottomPane, minTop=160, minBottom=96){
  let dragging=false;
  divider.addEventListener('mousedown', e=>{ dragging=true; document.body.classList.add('dragging'); e.preventDefault(); });
  window.addEventListener('mousemove', e=>{
    if(!dragging) return;
    const rect = appRoot.getBoundingClientRect();
    const headerH = appRoot.querySelector('header').offsetHeight;
    let y = e.clientY - rect.top;
    y = Math.max(headerH+minTop, Math.min(rect.height - minBottom, y));
    bottomPane.style.height = (rect.height - y) + 'px';
  });
  window.addEventListener('mouseup', ()=>{ dragging=false; document.body.classList.remove('dragging'); });
}
