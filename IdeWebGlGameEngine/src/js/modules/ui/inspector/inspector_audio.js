import AudioService from '../../services/audio.service.js';

export function mount(el){
  el.innerHTML = '';
  const list = document.createElement('div');
  el.appendChild(list);
  const add = document.createElement('button');
  add.textContent = 'Add Channel';
  add.className = 'mt-2 px-2 py-1 bg-slate-700 text-xs rounded';
  add.onclick = () => { AudioService.addChannel(); refresh(); };
  el.appendChild(add);

  function refresh(){
    list.innerHTML='';
    AudioService.getChannels().forEach(ch => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-1 py-1';
      const label = document.createElement('span');
      label.textContent = ch.name;
      label.className = 'flex-1 text-xs';
      const play = document.createElement('button');
      play.textContent = ch.playing ? 'Stop' : 'Play';
      play.className = 'px-1 bg-slate-600 text-xs rounded';
      play.onclick = () => { ch.playing ? AudioService.stop(ch.id) : AudioService.play(ch.id); refresh(); };
      const del = document.createElement('button');
      del.textContent = '✖';
      del.className = 'px-1 text-red-400';
      del.onclick = () => { AudioService.removeChannel(ch.id); refresh(); };
      const meter = document.createElement('div');
      meter.className = 'w-16 h-2 bg-gradient-to-r from-green-400 to-red-600';
      row.append(label, play, del, meter);
      list.appendChild(row);
    });
  }
  refresh();
}

export default { mount };
