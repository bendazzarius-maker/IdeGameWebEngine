// PATH: src/js/services/node.factory.js
// Bloc 1 — imports
import catalog from '../../data/nodes_catalog_enriched.json' assert { type:'json' };

// Bloc 2 — dictionaries / constants
// (none)

// Bloc 3 — classes / functions / logic
export function create(type){
  return catalog[type] ? { type, ...catalog[type] } : null;
}
export function list(){
  return Object.keys(catalog);
}

// Bloc 4 — event wiring / init
export default { create, list };
