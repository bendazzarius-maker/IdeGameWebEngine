// src/core/EventBus.js
// Minimal event bus for communication between modules

export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Register a listener for an event.
   * @param {string} evt
   * @param {(payload:any)=>void} fn
   * @returns {() => void} unsubscribe function
   */
  on(evt, fn) {
    if (!this._listeners.has(evt)) this._listeners.set(evt, new Set());
    const set = this._listeners.get(evt);
    set.add(fn);
    return () => this.off(evt, fn);
  }

  /** Remove listener or all listeners for event */
  off(evt, fn) {
    const set = this._listeners.get(evt);
    if (!set) return;
    if (fn) set.delete(fn); else set.clear();
    if (!set.size) this._listeners.delete(evt);
  }

  /** Emit event with optional payload */
  emit(evt, payload) {
    const set = this._listeners.get(evt);
    if (!set) return;
    for (const fn of [...set]) {
      try {
        fn(payload);
      } catch (err) {
        console.error('[EventBus]', err);
      }
    }
  }
}

export default EventBus;

