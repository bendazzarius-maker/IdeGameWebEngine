// PATH: src/js/services/codegen.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
// (none)

// Bloc 3 — classes / functions / logic
export function generate(graph, name='Generated'){ 
  const code = `// Generated from graph\nexport function run(){ console.log('running ${name}'); }`;
  bus.emit('code.generated', { name, code });
  return code;
}
export function simulate(graph){
  bus.emit('code.simulated', { graph });
  console.log('[simulate]', graph);
}

// Bloc 4 — event wiring / init
export default { generate, simulate };
