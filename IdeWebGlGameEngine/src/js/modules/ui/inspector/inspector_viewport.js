// Interface du panneau Inspector pour le viewport 3D

import View3D from '../../viewport3d/engine.js';
import { importGLTF } from '../../import/gltf_importer.js';

// Rend les boutons de contrôle du viewport
export function render(el){
  const wrap = document.createElement('div');
  wrap.className = 'p-2 flex flex-col gap-2 text-xs';

  // Modes de transformation
  const modes = [
    { label: 'Move',   mode: 'translate' },
    { label: 'Rotate', mode: 'rotate' },
    { label: 'Scale',  mode: 'scale' }
  ];
  const rowModes = document.createElement('div');
  rowModes.className = 'flex gap-1';
  modes.forEach(m => {
    const b = document.createElement('button');
    b.textContent = m.label;
    b.className = 'px-2 py-1 bg-slate-700';
    b.onclick = () => View3D.setTransformMode(m.mode);
    rowModes.appendChild(b);
  });
  wrap.appendChild(rowModes);

  // Ajout de lumières
  const lights = [
    { label: '+Directional', kind: 'directional' },
    { label: '+Point',       kind: 'point' },
    { label: '+Spot',        kind: 'spot' }
  ];
  const rowLights = document.createElement('div');
  rowLights.className = 'flex gap-1';
  lights.forEach(l => {
    const b = document.createElement('button');
    b.textContent = l.label;
    b.className = 'px-2 py-1 bg-slate-700';
    b.onclick = () => View3D.addLight(l.kind);
    rowLights.appendChild(b);
  });
  wrap.appendChild(rowLights);

  // Import de fichiers GLTF
  const impBtn = document.createElement('button');
  impBtn.textContent = 'Importer GLTF';
  impBtn.className = 'px-2 py-1 bg-slate-700';
  impBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gltf,.glb';
    input.onchange = () => { const f = input.files[0]; if (f) importGLTF(f); };
    input.click();
  };
  wrap.appendChild(impBtn);

  el.appendChild(wrap);
}

export default { render };

