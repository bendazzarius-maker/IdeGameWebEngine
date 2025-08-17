// Bloc 1 imports
import { mountOutliner } from './js/ui/outliner.dom.js';
import { mountViewport } from './js/ui/viewport.canvas.js';
import GLTFImporter from './js/services/gltf.importer.js';

// Bloc 2 constantes/dictionnaires
const { importGLTF } = GLTFImporter;

// Bloc 3 opérateurs
async function boot(){
  let outEl = document.querySelector('#outliner') ||
              document.querySelector('.outliner') ||
              document.querySelector('[data-role="outliner"]');
  if(!outEl){
    outEl = document.createElement('div');
    outEl.id = 'outliner';
    document.body.appendChild(outEl);
  }
  mountOutliner(outEl);

  let vp = document.querySelector('#viewport-canvas') ||
           document.querySelector('.viewport canvas') ||
           document.querySelector('[data-role="viewport-canvas"]');
  if(!vp){
    const placeholder = document.querySelector('[data-role="viewport3d-canvas"]') || document.querySelector('#viewport3d');
    vp = document.createElement('canvas');
    vp.id = 'viewport-canvas';
    if(placeholder && placeholder.parentElement) placeholder.parentElement.replaceChild(vp, placeholder);
    else document.body.appendChild(vp);
  }
  mountViewport(vp);

  const params = new URLSearchParams(window.location.search);
  const url = params.get('model');
  if(url) await importGLTF(url);
}

document.addEventListener('DOMContentLoaded', boot);

// Bloc 4 exports
export default {};
