// PATH: src/js/modules/ui/menu.file.js
// Bloc 1 — imports
import Project from '../../services/project.service.js';

// Bloc 2 — dictionaries / constants
// (none)

// Bloc 3 — classes / functions / logic
export function mount(root){
  if(!root) return;
  root.addEventListener('click', e=>{
    const act = e.target.dataset.act;
    if(act==='new') Project.newProject();
    else if(act==='open') Project.load({});
    else if(act==='save') Project.save({});
  });
}

// Bloc 4 — event wiring / init
export default { mount };
