// PATH: src/js/modules/ui/inspector/inspector_audio.js
// Bloc 1 — imports
import bus from '../../../core/bus.js';
import Audio from '../../../services/audio.service.js';

// Bloc 2 — dictionaries / constants
const el = { root:null };

// Bloc 3 — classes / functions / logic
export function mount(root){
  el.root = root;
  if(!Audio.getState().channels.length){ Audio.addChannel({name:'Ch1'}); Audio.addChannel({name:'Ch2'}); }
  render();
}
function render(){
  const s = Audio.getState();
  el.root.innerHTML = `
    <div class="mixer">
      <div class="master"><div class="vu"></div></div>
      <div class="channels">
        ${s.channels.map(ch => `
          <div class="ch" data-id="${ch.id}">
            <header><span>${ch.name}</span><button class="rm">✖</button></header>
            <div class="vu"></div>
            <div class="controls">
              <button class="play">Play</button>
              <button class="stop">Stop</button>
              <label><input type="checkbox" class="loop"${ch.loop?' checked':''}/> Loop</label>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="add">+ Add Channel</button>
    </div>`;
  wire();
}
function wire(){
  el.root.querySelector('.add')?.addEventListener('click', ()=>{ Audio.addChannel({name:'Ch'+(Audio.getState().channels.length+1)}); render(); });
  el.root.querySelectorAll('.ch').forEach(chEl=>{
    const id = chEl.dataset.id;
    chEl.querySelector('.rm')?.addEventListener('click', ()=>{ Audio.removeChannel(id); render(); });
    chEl.querySelector('.play')?.addEventListener('click', ()=>Audio.play(id));
    chEl.querySelector('.stop')?.addEventListener('click', ()=>Audio.stop(id));
    chEl.querySelector('.loop')?.addEventListener('change', e=>{
      bus.emit('audio.channel.update', { id, loop: e.target.checked });
    });
  });
}

// Bloc 4 — event wiring / init
export default { mount };
