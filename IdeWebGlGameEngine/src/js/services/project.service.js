import { OutlinerService } from './outliner.service.js';

export function saveProject(){
  const data = OutlinerService.snapshot();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'project.json'; a.click();
  URL.revokeObjectURL(url);
}

export async function openProject(file){
  const text = await file.text();
  const json = JSON.parse(text);
  console.log('openProject stub', json);
  // TODO: restore collections/objects
}

export default { saveProject, openProject };
