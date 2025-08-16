// BLOCK 1 — imports
import bus from '../core/bus.js';

// BLOCK 2 — state / types / constants
const store = new Map();
const DEFAULT = { loc:[0,0,0], rot:[0,0,0], scl:[1,1,1], space:'LOCAL', order:'XYZ', dims:[0,0,0] };

// BLOCK 3 — operators
function get(id) {
  const t = store.get(id) || DEFAULT;
  return { loc:[...t.loc], rot:[...t.rot], scl:[...t.scl], space:t.space, order:t.order, dims:[...t.dims] };
}
function set(id, tr) {
  const cur = { ...DEFAULT, ...(tr||{}) };
  store.set(id, { loc:[...cur.loc], rot:[...cur.rot], scl:[...cur.scl], space:cur.space, order:cur.order, dims:[...cur.dims] });
  bus.emit('transform:changed', { id, t: get(id) });
  return get(id);
}

// BLOCK 4 — exports
export default { get, set };
