import { OutlinerService } from './outliner.service.js';

const _props = new Map(); // objectId -> Map<name, {name,type,value,flags?}>
const listeners = new Set();

function emit(evt, payload){ listeners.forEach(fn=>fn(evt, payload)); }

export const GameProps = {
  on(fn){ listeners.add(fn); return ()=>listeners.delete(fn); },
  list(objectId){ return Array.from(_props.get(objectId)?.values() || []); },
  set(objectId, name, type='number', value=0, flags={}){
    if (!OutlinerService.snapshot().objects[objectId]) return;
    const m = _props.get(objectId) || new Map(); _props.set(objectId, m);
    const gp = { name, type, value, flags };
    m.set(name, gp);
    emit('set', { objectId, gp });
    return gp;
  },
  remove(objectId, name){
    const m = _props.get(objectId); if(!m) return;
    m.delete(name);
    emit('remove', { objectId, name });
  },
  rename(objectId, from, to){
    const m = _props.get(objectId); if(!m || !m.has(from)) return;
    const gp = m.get(from); m.delete(from); gp.name = to; m.set(to, gp);
    emit('rename', { objectId, from, to });
  },
  snapshot(){ const s={}; _props.forEach((m,oid)=> s[oid]=Array.from(m.values())); return s; }
};

export default GameProps;
