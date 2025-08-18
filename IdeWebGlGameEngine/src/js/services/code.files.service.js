// PATH: src/js/services/code.files.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
const files = new Map();

// Bloc 3 — classes / functions / logic
export function saveFile(name, content){
  files.set(name, content);
  bus.emit('asset.added', { type:'code', name });
  return name;
}
export function removeFile(name){ files.delete(name); }
export function listFiles(){ return [...files.keys()]; }
export function getFile(name){ return files.get(name) || ''; }

// Bloc 4 — event wiring / init
export default { saveFile, removeFile, listFiles, getFile };
