import * as Project from '../../services/project.service.js';

export function mount(el){
  const newBtn = el.querySelector('[data-act="new"]');
  const openInput = el.querySelector('[data-act="open"]');
  const saveBtn = el.querySelector('[data-act="save"]');
  newBtn?.addEventListener('click', ()=> location.reload());
  openInput?.addEventListener('change', (e)=>{ const f=e.target.files[0]; if(f) Project.openProject(f); });
  saveBtn?.addEventListener('click', ()=> Project.saveProject());
}

export default { mount };
