// ===== IMPORTS =====
import { NodeCatalog, ensureCatalogLoaded } from './catalog.js';

// ===== GROUPING =====
function groupByCategory(list){
  const cats = new Map();
  for (const spec of list){
    const cat = spec.category || 'General';
    const sub = spec.subcategory || 'Misc';
    if (!cats.has(cat)) cats.set(cat, new Map());
    const subs = cats.get(cat);
    if (!subs.has(sub)) subs.set(sub, []);
    subs.get(sub).push(spec);
  }
  return Array.from(cats.entries())
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([cat, subs]) => [cat, Array.from(subs.entries())
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([sub, items])=>[sub, items.sort((x,y)=>(x.title||x.type).localeCompare(y.title||y.type))])]);
}

// ===== RENDER =====
function renderResults(container, grouped, query, onCreate){
  const q = (query||'').trim().toLowerCase();
  container.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const [cat, subs] of grouped){
    const h = document.createElement('div');
    h.className='px-3 pt-3 pb-1 text-[10px] uppercase text-slate-400';
    h.textContent = cat;
    frag.appendChild(h);

    for (const [sub, items] of subs){
      const sh = document.createElement('div');
      sh.className='px-3 pt-2 pb-1 text-[10px] uppercase text-slate-500';
      sh.textContent = `› ${sub}`;
      frag.appendChild(sh);

      const grid = document.createElement('div');
      grid.className='px-2 pb-2 flex flex-wrap';
      items.filter(s => !q || (s.title||'').toLowerCase().includes(q) || (s.type||'').toLowerCase().includes(q))
           .forEach(spec => {
             const btn=document.createElement('button');
             btn.className='m-1 px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-100';
             btn.textContent=spec.title || spec.type;
             btn.title=spec.type;

             // click = créer
             btn.onclick=()=> onCreate && onCreate(spec.type);

            // drag = DnD vers node-area
            btn.draggable = true;
            btn.ondragstart = (e) => {
               e.dataTransfer.setData("application/x-node-type", JSON.stringify(spec));
            };

             grid.appendChild(btn);
           });
      frag.appendChild(grid);
    }
  }
  container.appendChild(frag);
}

// ===== API =====
export async function renderLibrary(panelEl, { onCreate } = {}){
  if (!panelEl) return;

  // shell fixe
  panelEl.innerHTML = `
    <div class="p-2 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
      <input type="search" placeholder="Search node..."
             class="w-full text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 outline-none"
             data-role="lib-search">
    </div>
    <div data-role="lib-results"></div>
  `;
  const input = panelEl.querySelector('[data-role="lib-search"]');
  const results = panelEl.querySelector('[data-role="lib-results"]');

  await ensureCatalogLoaded();
  const grouped = groupByCategory(NodeCatalog || []);
  renderResults(results, grouped, '', onCreate);

  input.addEventListener('input', () => {
    renderResults(results, grouped, input.value, onCreate);
  });
}
