// Inspector pour le contexte de visual scripting

import { EventBus } from '../../system/event_bus.js';
import * as GameProps from '../../data/game_properties.js';

let currentId = null;
EventBus.on('objectSelected', id=>{ currentId = id; });

export function render(el){
  if(!currentId){ el.textContent='Sélectionnez un node pour voir ses propriétés'; return; }
  const props = GameProps.list(currentId);
  props.forEach(gp=>{
    const row = document.createElement('div');
    row.className='flex gap-2 text-xs py-1';
    row.textContent = `${gp.name}: ${gp.value}`;
    el.appendChild(row);
  });
}
