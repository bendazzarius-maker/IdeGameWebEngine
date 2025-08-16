// Bloc 1 imports
import bus from '../core/bus.js';

// Bloc 2 state / types / constantes
const _t = new Map();
const _def = { loc:[0,0,0], rot:[0,0,0], scl:[1,1,1], space:'Local', order:'XYZ', dims:[1,1,1] };

// Bloc 3 opérateurs
function get(id){
  return _t.get(id) || { ..._def };
}
function set(id, tr){
  const cur = { ..._def, ...(tr||{}) };
  _t.set(id, cur);
  // TODO: apply to runtime (world/local conversions)
  bus.emit('transform:changed', { id, t: { ...cur } });
  return cur;
}

// Bloc 4 exports
export default { get, set };
