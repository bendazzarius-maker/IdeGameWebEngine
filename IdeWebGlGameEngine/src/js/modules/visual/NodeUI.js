// src/js/modules/visual/ui/NodeUI.js
// Aides UI génériques utilisées par le renderer — toutes optionnelles
export function h(tag, props={}, ...children){
  const el = document.createElement(tag);
  Object.entries(props||{}).forEach(([k,v]) => {
    if (k in el) { el[k] = v; } else { el.setAttribute(k, v); }
  });
  children.flat().forEach(c => el.appendChild(typeof c==='string' ? document.createTextNode(c) : c));
  return el;
}

export function icon(name){ const i=document.createElement('span'); i.textContent=name; i.className='text-xs opacity-70'; return i; }
export function tooltip(el, text){ if(!el) return el; el.title = text; return el; }