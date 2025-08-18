// PATH: src/js/services/audio.service.js
// Bloc 1 — imports
import bus from '../core/bus.js';

// Bloc 2 — dictionaries / constants
const state = { master: { gain: 1.0 }, channels: [] };

// Bloc 3 — classes / functions / logic
export function addChannel(props={ name:'Ch', loop:false }) {
  const id = 'ch_'+Math.random().toString(36).slice(2);
  state.channels.push({ id, gain:1, mute:false, solo:false, ...props });
  bus.emit('audio.channel.add', { id, props: { ...props } });
  return id;
}
export function removeChannel(id){
  const i = state.channels.findIndex(c=>c.id===id);
  if(i>=0){ state.channels.splice(i,1); bus.emit('audio.channel.remove',{id}); }
}
export function play(id){ bus.emit('audio.channel.update',{id, action:'play'}); }
export function stop(id){ bus.emit('audio.channel.update',{id, action:'stop'}); }
export function getState(){ return state; }

// Bloc 4 — event wiring / init
export default { addChannel, removeChannel, play, stop, getState };
