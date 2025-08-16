// Gestion globale du contexte actif de l'IDE
// Permet de savoir quel onglet est en cours d'utilisation

import { EventBus } from './system/event_bus.js';

let currentContext = 'visual_scripting'; // contexte par défaut

/**
 * Change le contexte actif et avertit les modules abonnés
 * @param {string} ctx nom du nouveau contexte
 */
export function setContext(ctx){
  if(ctx === currentContext) return;
  currentContext = ctx;
  EventBus.emit('contextChanged', currentContext);
}

/**
 * Retourne le contexte actuellement actif
 * @returns {string}
 */
export function getContext(){
  return currentContext;
}

/**
 * Abonne une fonction aux changements de contexte
 * @param {Function} cb callback appelée lors du changement
 * @returns {Function} fonction de désabonnement
 */
export function onContextChanged(cb){
  return EventBus.on('contextChanged', cb);
}

export default { setContext, getContext, onContextChanged };
