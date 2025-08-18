// PATH: src/js/modules/ui/inspector/inspector_visual.js
// Bloc 1 — imports
import { EventBus } from '../../system/event_bus.js';
import * as GameProps from '../../data/game_properties.js';

// Bloc 2 — dictionaries/constants
let currentId = null;
let root = null;
EventBus.on('selection.changed', data => {
  currentId = typeof data === 'object' ? data.id : data;
  if (root) render();
});

// Bloc 3 — classes/functions/logic
export function mount(el){
  root = el;
  render();
}

function render(){
  const id = currentId;
  root.innerHTML = '';
  if(!id){ root.textContent = 'Sélectionnez un node pour voir ses propriétés'; return; }
  renderProperties(root, id);
}

function renderProperties(container, id){
  const list = document.createElement('div');
  container.appendChild(list);
  function refresh(){
    list.innerHTML = '';
    GameProps.list(id).forEach(gp => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-1 py-1';
      const name = document.createElement('input');
      name.value = gp.name;
      name.className = 'w-24 bg-slate-700 text-xs px-1';
      const type = document.createElement('select');
      ['bool','int','float','string'].forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t; if(gp.type===t) o.selected = true; type.appendChild(o);
      });
      type.className = 'bg-slate-700 text-xs';
      const valWrap = document.createElement('span');
      function valueInput(t, v){
        let input;
        switch(t){
          case 'bool':
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = Boolean(v);
            input.onchange = () => { GameProps.set(id, gp.name, t, castValue(t, input.checked)); refresh(); };
            break;
          case 'int':
            input = document.createElement('input');
            input.type = 'number';
            input.step = '1';
            input.value = parseInt(v)||0;
            input.onchange = () => { GameProps.set(id, gp.name, t, castValue(t, input.value)); refresh(); };
            break;
          case 'float':
            input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.value = (parseFloat(v)||0).toFixed(2);
            input.onchange = () => { GameProps.set(id, gp.name, t, castValue(t, input.value)); refresh(); };
            break;
          default:
            input = document.createElement('input');
            input.type = 'text';
            input.value = v ?? '';
            input.onchange = () => { GameProps.set(id, gp.name, t, castValue(t, input.value)); refresh(); };
        }
        input.className = 'flex-1 bg-slate-700 text-xs px-1';
        return input;
      }
      let valInput = valueInput(gp.type, gp.value);
      valWrap.appendChild(valInput);

      const del = document.createElement('button');
      del.textContent = '×';
      del.className = 'text-red-400 px-1';
      del.onclick = () => { GameProps.remove(id, gp.name); refresh(); };
      name.onchange = () => { GameProps.rename(id, gp.name, name.value); refresh(); };
      type.onchange = () => {
        const newType = type.value;
        GameProps.set(id, gp.name, newType, defaultValue(newType));
        refresh();
      };
      row.append(name, type, valWrap, del);
      list.appendChild(row);
    });
  }
  refresh();
  const add = document.createElement('button');
  add.textContent = 'Ajouter';
  add.className = 'mt-2 px-2 py-1 bg-slate-700 text-xs';
  add.onclick = () => { GameProps.set(id, 'prop', 'bool', false); refresh(); };
  container.appendChild(add);
}

function defaultValue(t){
  switch(t){
    case 'bool': return false;
    case 'int': return 0;
    case 'float': return 0.0;
    default: return '';
  }
}
function castValue(t,v){
  switch(t){
    case 'bool': return !!v;
    case 'int': return parseInt(v)||0;
    case 'float': return parseFloat(v)||0;
    default: return String(v||'');
  }
}

// Bloc 4 — event wiring/init
export default { mount };
