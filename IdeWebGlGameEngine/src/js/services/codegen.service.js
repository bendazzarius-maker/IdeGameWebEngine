import bus from '../core/bus.js';

export function generate(graph){
  const code = '// generated code\n' + JSON.stringify(graph, null, 2);
  console.log(code);
  bus.emit('code.generated', { code });
  return code;
}

export default { generate };
