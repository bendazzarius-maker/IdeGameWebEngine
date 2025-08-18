import { importGLTF } from '../../services/gltf.importer.js';

export function mount(input){
  input.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(file) importGLTF(file);
  });
}

export default { mount };
