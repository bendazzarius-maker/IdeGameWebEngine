// src/js/modules/visual/viewport.js
// Pan/zoom confinés au conteneur, clic droit menu +/−/reset
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const DEFAULTS = { minScale: 0.25, maxScale: 2.5, scaleStep: 1.1 };

export function attachViewport(containerEl, contentEl, { zoomLabelEl, onZoomChanged, extendMenu } = {}) {
  if (!containerEl || !contentEl) return;
  containerEl.style.position = containerEl.style.position || 'relative';
  containerEl.style.overflow = 'hidden';
  containerEl.style.userSelect = 'none';
  contentEl.style.transformOrigin = '0 0';
  contentEl.style.willChange = 'transform';
  contentEl.style.position = contentEl.style.position || 'absolute';
  contentEl.style.left = '0px'; contentEl.style.top = '0px';

  const cam = { x: 0, y: 0, s: 1 };
  const state = { panning: false, panStartX: 0, panStartY: 0, startX: 0, startY: 0 };

  const applyTransform = () => {
    contentEl.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    if (zoomLabelEl) zoomLabelEl.textContent = `${Math.round(cam.s * 100)}%`;
    onZoomChanged && onZoomChanged(cam);
  };

  function makeContextMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = `position:fixed; z-index:9999; min-width:180px; background:#0f172a; color:#e2e8f0;
      border:1px solid #334155; border-radius:8px; padding:6px; box-shadow:0 8px 24px rgba(0,0,0,.5); font-size:12px; display:none;`;
    menu.addItem = (label, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = 'width:100%; text-align:left; padding:6px 8px; border:0; background:transparent; color:inherit; border-radius:6px; cursor:pointer;';
      b.onmouseenter = () => (b.style.background = '#1e293b');
      b.onmouseleave = () => (b.style.background = 'transparent');
      b.onclick = () => { try{ fn(); } finally { menu.hide(); } };
      menu.appendChild(b);
    };
    menu.show = (x,y) => { menu.style.left = x+'px'; menu.style.top = y+'px'; menu.style.display='block'; };
    menu.hide = () => { menu.style.display='none'; };
    document.body.appendChild(menu);
    document.addEventListener('click', () => menu.hide());
    window.addEventListener('blur', () => menu.hide());
    return menu;
  }
  const ctxMenu = makeContextMenu();

  containerEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = containerEl.getBoundingClientRect();
    const { clientX, clientY, deltaY } = e;
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const dir = deltaY > 0 ? (1 / DEFAULTS.scaleStep) : DEFAULTS.scaleStep;
    const newS = clamp(cam.s * dir, DEFAULTS.minScale, DEFAULTS.maxScale);
    const k = newS / cam.s;
    cam.x = localX - k * (localX - cam.x);
    cam.y = localY - k * (localY - cam.y);
    cam.s = newS;
    applyTransform();
  }, { passive: false });

  containerEl.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
      e.preventDefault();
      state.panning = true;
      state.panStartX = e.clientX;
      state.panStartY = e.clientY;
      state.startX = cam.x;
      state.startY = cam.y;
      document.body.style.cursor = 'grabbing';
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (!state.panning) return;
    const dx = e.clientX - state.panStartX;
    const dy = e.clientY - state.panStartY;
    cam.x = state.startX + dx;
    cam.y = state.startY + dy;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    if (state.panning) { state.panning = false; document.body.style.cursor = ''; }
  });

  containerEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctxMenu.innerHTML = '';
    ctxMenu.addItem('Zoom +',  () => { cam.s = clamp(cam.s * DEFAULTS.scaleStep, DEFAULTS.minScale, DEFAULTS.maxScale); applyTransform(); });
    ctxMenu.addItem('Zoom -',  () => { cam.s = clamp(cam.s / DEFAULTS.scaleStep, DEFAULTS.minScale, DEFAULTS.maxScale); applyTransform(); });
    ctxMenu.addItem('Reset vue', () => { cam.x = 0; cam.y = 0; cam.s = 1; applyTransform(); });
    extendMenu && extendMenu(ctxMenu, cam);
    ctxMenu.show(e.clientX, e.clientY);
  });

  applyTransform();

  return {
    getCamera() { return { ...cam }; },
    setCamera(x, y, s) { cam.x = x; cam.y = y; cam.s = clamp(s, DEFAULTS.minScale, DEFAULTS.maxScale); applyTransform(); },
    destroy() {}
  };
}