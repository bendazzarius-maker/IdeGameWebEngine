// PATH: src/js/modules/ui/inspector/inspector_code.js
// Bloc 1 — imports
import CodeGen from '../../../services/codegen.service.js';

// Bloc 2 — dictionaries/constants
// (none)

// Bloc 3 — classes/functions/logic
export function mount(root){
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col gap-2';
  const gen = document.createElement('button');
  gen.textContent = 'Generate JS';
  gen.className = 'px-2 py-1 bg-slate-700 text-xs';
  const sim = document.createElement('button');
  sim.textContent = 'Simulate';
  sim.className = 'px-2 py-1 bg-slate-700 text-xs';
  const log = document.createElement('pre');
  log.className = 'mt-2 bg-slate-900 text-xs p-2';
  gen.onclick = () => {
    const code = CodeGen.generate(null, 'Graph');
    log.textContent = code;
  };
  sim.onclick = () => {
    CodeGen.simulate(null);
    log.textContent = 'Simulation logged in console';
  };
  wrap.append(gen, sim, log);
  root.appendChild(wrap);
}

// Bloc 4 — event wiring/init
export default { mount };
