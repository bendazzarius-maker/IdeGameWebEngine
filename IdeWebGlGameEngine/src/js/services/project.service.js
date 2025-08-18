// PATH: src/js/services/project.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
// (none)

// Bloc 3 — classes / functions / logic
export function newProject(){ bus.emit('project.new'); }
export function save(data){ bus.emit('project.save', data); }
export function load(data){ bus.emit('project.load', data); }

// Bloc 4 — event wiring / init
export default { newProject, save, load };
