// Bloc 1 imports
import { mountOutliner } from '../../ui/outliner.dom.js';

// Bloc 2 constantes/dictionnaires
// none

// Bloc 3 opérateurs
function legacyNotice(){
  console.warn('[Legacy] src/js/modules/outliner/outliner.js is deprecated. Use src/js/ui/outliner.dom.js instead.');
}
legacyNotice();

// Bloc 4 exports
export { mountOutliner };
export default { mountOutliner };
