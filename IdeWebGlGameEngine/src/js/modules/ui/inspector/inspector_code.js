import * as Codegen from '../../services/codegen.service.js';
import * as NodeFactory from '../../services/node.factory.js';

export function mount(el){
  el.innerHTML = '';
  const gen = document.createElement('button');
  gen.textContent = 'Generate JS';
  gen.className = 'px-2 py-1 bg-slate-700 text-xs rounded mr-2';
  const sim = document.createElement('button');
  sim.textContent = 'Simulate';
  sim.className = 'px-2 py-1 bg-slate-700 text-xs rounded';

  gen.onclick = () => {
    const graph = NodeFactory.getGraph();
    const js = Codegen.generate(graph);
    console.log(js);
  };
  sim.onclick = () => {
    const graph = NodeFactory.getGraph();
    console.log('Simulate', graph);
  };
  el.append(gen, sim);
}

export default { mount };
