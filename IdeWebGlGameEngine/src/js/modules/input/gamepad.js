// /src/js/modules/input/gamepad.js
import { log } from '../../core/dom.js';

export class GamepadManager{
  constructor(){ this.index=null; this.listeners=new Set(); }
  start(){
    window.addEventListener('gamepadconnected',(e)=>{ this.index=e.gamepad.index; log('Gamepad: '+e.gamepad.id); });
    window.addEventListener('gamepaddisconnected',(e)=>{ if(this.index===e.gamepad.index){ this.index=null; log('Gamepad disconnected'); }});
    const poll=()=>{ if(this.index!=null){ const gp=navigator.getGamepads?.()[this.index]; if(gp){ const st={axes:gp.axes.slice(0), buttons:gp.buttons.map(b=>({pressed:b.pressed,value:b.value}))}; this.listeners.forEach(cb=>cb(st)); } } requestAnimationFrame(poll); }; poll();
  }
  onChange(cb){ this.listeners.add(cb); return ()=>this.listeners.delete(cb); }
}
