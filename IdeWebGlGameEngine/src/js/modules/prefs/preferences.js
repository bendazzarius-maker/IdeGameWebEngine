const listeners = new Set();
const store = {
  gpuBudgetMB: 1024,
  cpuBudgetPct: 80,
  memBudgetMB: 2048,
  textureMaxSize: 4096,
  maxObjects: 10000
};
export function setPref(key, val){ store[key]=val; listeners.forEach(fn=>fn(store)); }
export function getPref(key){ return store[key]; }
export function onChange(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function renderPreferences(el){
  el.innerHTML='';
  const mk=(label,key,type='number')=>{
    const row=document.createElement('div'); row.className='flex items-center gap-3 py-1';
    const l=document.createElement('label'); l.textContent=label; l.className='w-40 text-sm text-slate-300';
    const i=document.createElement('input'); i.type=type; i.value=store[key]; i.className='text-xs bg-slate-700 rounded px-2 py-1';
    i.onchange=()=>setPref(key, type==='number'?Number(i.value):i.value);
    row.append(l,i); el.appendChild(row);
  };
  mk('GPU Budget (MB)','gpuBudgetMB'); mk('CPU Budget (%)','cpuBudgetPct'); mk('RAM Budget (MB)','memBudgetMB');
  mk('Texture max size','textureMaxSize'); mk('Max Objects','maxObjects');
}
export default { setPref, getPref, onChange, renderPreferences };
