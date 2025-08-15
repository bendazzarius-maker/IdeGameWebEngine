/* ========================================================================
   src/js/modules/visual/catalog.js
   ======================================================================== */

/* ===== BLOCK 1 — EXPORTS COMPAT ===== */
export const PinKinds = Object.freeze({
  IN: 'in',
  OUT: 'out',
  FIELD: 'field',
  in: 'in',
  out: 'out',
  field: 'field',
});

export let NodeCatalog = [];
export let ColorMap = {};

const CATALOG_URL  = '/src/data/nodes_catalog_enriched.json';
const COLORMAP_URL = '/src/data/nodes_color_map.json';

const FALLBACK_COLORMAP = {
  exec:      '#ef4444',
  condition: '#ef4444',
  bool:      '#a78bfa',
  int:       '#fca5a5',
  float:     '#22d3ee',
  vector:    '#8b5cf6',
  string:    '#fbbf24',
  object:    '#94a3b8',
  any:       '#94a3b8',
};

const FALLBACK_CATALOG = [
  {
    type: 'objects.get_object',
    title: 'Get Object',
    category: 'Objects',
    subcategory: 'Query',
    outputs: [{ name: 'Object', type: 'object' }],
    inputs:  [{ name: 'object', type: 'string', kind: 'field', ui: 'dropdown' }],
  },
  {
    type: 'physics.raycast',
    title: 'Raycast',
    category: 'Physics',
    subcategory: 'Trace',
    outputs: [
      { name: 'Has Result',    type: 'bool'   },
      { name: 'Picked Object', type: 'object' },
      { name: 'Picked Point',  type: 'vector' },
      { name: 'Picked Normal', type: 'vector' },
      { name: 'Ray Direction', type: 'vector' },
    ],
    inputs: [
      { name: 'Condition',       type: 'exec'   },
      { name: 'Origin',          type: 'vector', kind: 'field', ui: 'vector' },
      { name: 'Local',           type: 'bool',   kind: 'field', ui: 'checkbox' },
      { name: 'Property',        type: 'string', kind: 'field', ui: 'text' },
      { name: 'Exclude',         type: 'bool',   kind: 'field', ui: 'checkbox' },
      { name: 'X-Ray',           type: 'bool',   kind: 'field', ui: 'checkbox' },
      { name: 'Custom Distance', type: 'float',  kind: 'field', ui: 'number' },
    ],
  },
  {
    type: 'flow.every_frame',
    title: 'Every Frame',
    category: 'Flow',
    subcategory: 'Events',
    outputs: [{ name: 'Update', type: 'exec' }],
    inputs: [],
  },
];

async function loadJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

function normalizeAndColorize(list) {
  return (list || []).map(spec => {
    spec.category    = spec.category    || (spec.type?.split('.')?.[0] || 'General');
    spec.subcategory = spec.subcategory || (spec.type?.split('.')?.[1] || 'Misc');
    spec.title       = spec.title || spec.name || spec.type;

    (spec.inputs  || []).forEach(p => p.color = p.color || ColorMap[p.type] || '#94a3b8');
    (spec.outputs || []).forEach(p => p.color = p.color || ColorMap[p.type] || '#94a3b8');
    return spec;
  });
}

function dispatchReady() {
  window.dispatchEvent(new CustomEvent('NodeCatalogReady', { detail: { NodeCatalog, ColorMap } }));
}

/* ===== BLOCK 4 — API ===== */
export async function ensureCatalogLoaded() {
  if (NodeCatalog.length) return { NodeCatalog, ColorMap };

  ColorMap = await loadJSON(COLORMAP_URL) || FALLBACK_COLORMAP;
  const list = await loadJSON(CATALOG_URL) || FALLBACK_CATALOG;

  NodeCatalog = normalizeAndColorize(list);
  dispatchReady();
  return { NodeCatalog, ColorMap };
}

export function portColor(type) { return (ColorMap && ColorMap[type]) || '#94a3b8'; }
export function getSpecByType(type) { return (NodeCatalog || []).find(s => (s.type || s.id) === type) || null; }

ensureCatalogLoaded();
