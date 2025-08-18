// PATH: src/js/services/assets.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
const assets = [];

// Bloc 3 — classes / functions / logic
export function index(list=[]){
  list.forEach(a=>{ assets.push(a); bus.emit('asset.added', a); });
  bus.emit('asset.indexed', { count: assets.length });
}
export function getAll(){ return [...assets]; }

// Bloc 4 — event wiring / init
export default { index, getAll };
