import bus from '../../system/event_bus.js';
import * as GameProps from '../../data/game_properties.js';

let currentId = null;
bus.on('selection.changed', ({ id }) => { currentId = id; });
let root;

export function mount(el) {
  root = el;
  render();
}

function render() {
  if (!root) return;
  root.innerHTML = '';
  if (!currentId) {
    root.textContent = 'Sélectionnez un objet';
    return;
  }
  renderProperties(root, currentId);
}

function renderProperties(el, id) {
  const list = document.createElement('div');
  el.appendChild(list);

  function refresh() {
    list.innerHTML = '';
    GameProps.list(id).forEach(prop => list.appendChild(row(prop)));
  }

  function row(prop) {
    const r = document.createElement('div');
    r.className = 'flex items-center gap-1 py-1';

    const name = document.createElement('input');
    name.value = prop.name;
    name.className = 'w-24 bg-slate-700 text-xs px-1';
    name.onchange = () => { GameProps.rename(id, prop.name, name.value); render(); };

    const type = document.createElement('select');
    ['bool','int','float','string'].forEach(t => {
      const o = document.createElement('option'); o.value = t; o.textContent = t; if (prop.type===t) o.selected = true; type.appendChild(o);
    });
    type.className = 'bg-slate-700 text-xs';
    type.onchange = () => {
      const newType = type.value;
      const val = cast(prop.value, newType);
      GameProps.set(id, prop.name, newType, val);
      render();
    };

    const val = buildInput(prop);
    val.onchange = () => {
      GameProps.set(id, prop.name, prop.type, readValue(val, prop.type));
    };

    const del = document.createElement('button');
    del.textContent = '×';
    del.className = 'text-red-400 px-1';
    del.onclick = () => { GameProps.remove(id, prop.name); render(); };

    r.append(name, type, val, del);
    return r;
  }

  refresh();
  const add = document.createElement('button');
  add.textContent = 'Ajouter';
  add.className = 'mt-2 px-2 py-1 bg-slate-700 text-xs';
  add.onclick = () => { GameProps.set(id, 'prop', 'bool', false); render(); };
  el.appendChild(add);
}

function buildInput({ type, value }) {
  let input = document.createElement('input');
  if (type === 'bool') {
    input.type = 'checkbox';
    input.checked = Boolean(value);
  } else if (type === 'int') {
    input.type = 'number';
    input.step = '1';
    input.value = parseInt(value) || 0;
  } else if (type === 'float') {
    input.type = 'number';
    input.step = '0.01';
    input.value = (parseFloat(value) || 0).toFixed(2);
  } else {
    input.type = 'text';
    input.value = value || '';
  }
  input.className = 'flex-1 bg-slate-700 text-xs px-1';
  return input;
}

function readValue(input, type) {
  if (type === 'bool') return input.checked;
  if (type === 'int') return parseInt(input.value) || 0;
  if (type === 'float') return parseFloat(input.value) || 0;
  return input.value;
}

function cast(value, type) {
  if (type === 'bool') return Boolean(value);
  if (type === 'int') return parseInt(value) || 0;
  if (type === 'float') return parseFloat(value) || 0;
  return value ? String(value) : '';
}

export default { mount };
