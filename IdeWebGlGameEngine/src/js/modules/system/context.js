// Gestionnaire global de contexte
// Permet de changer l'espace de travail actif (viewport, visual_scripting, audio)

import { EventBus } from './event_bus.js';

let contextActif = 'viewport';

/**
 * Définit le contexte actif et notifie les modules abonnés
 * @param {('viewport'|'visual_scripting'|'audio')} ctx
 */
export function setContexte(ctx){
  if(ctx === contextActif) return;
  contextActif = ctx;
  EventBus.emit('contextChanged', contextActif);
}

/** Retourne le contexte courant */
export function getContexte(){
  return contextActif;
}

export default { setContexte, getContexte };
