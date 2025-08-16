// Bus d'événements central pour l'IDE
// Chaque module peut émettre ou écouter les événements via ce bus

const _listeners = new Map(); // nom -> Set de callbacks

export const EventBus = {
  /**
   * Abonne une fonction à un événement
   * @param {string} evt nom de l'événement
   * @param {Function} cb callback appelée à l'émission
   * @returns {Function} fonction de désabonnement
   */
  on(evt, cb){
    if(!_listeners.has(evt)) _listeners.set(evt, new Set());
    _listeners.get(evt).add(cb);
    return () => _listeners.get(evt)?.delete(cb);
  },

  /**
   * Émet un événement
   * @param {string} evt nom de l'événement
   * @param {any} data données associées
   */
  emit(evt, data){
    (_listeners.get(evt) || []).forEach(fn => {
      try{ fn(data); }catch(err){ console.error(err); }
    });
  }
};

export default EventBus;
