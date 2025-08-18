import bus from '../core/bus.js';

const state = {
  channels: [
    { id: 'master', name: 'Master', playing: false, loop: true },
    { id: 'ch1', name: 'Channel 1', playing: false, loop: false },
    { id: 'ch2', name: 'Channel 2', playing: false, loop: false }
  ]
};

function getChannels(){ return state.channels; }

function addChannel(){
  const id = 'ch' + (state.channels.length);
  const ch = { id, name: 'Channel ' + state.channels.length, playing:false, loop:false };
  state.channels.push(ch);
  bus.emit('audio.channel.add', { id, props: ch });
  return id;
}

function removeChannel(id){
  const idx = state.channels.findIndex(c=>c.id===id);
  if(idx>=0){ state.channels.splice(idx,1); bus.emit('audio.channel.remove', { id }); }
}

function updateChannel(id, props){
  const ch = state.channels.find(c=>c.id===id);
  if(!ch) return;
  Object.assign(ch, props);
  bus.emit('audio.channel.update', { id, props });
}

function play(id){ updateChannel(id,{ playing:true, action:'play' }); }
function stop(id){ updateChannel(id,{ playing:false, action:'stop' }); }

export default { getChannels, addChannel, removeChannel, updateChannel, play, stop };
