// src/polyfills.js
// Provide Node-style globals that some libs (incl. TON libs) expect in the browser.

import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  // Some libs also check for global
  window.global = window.global || window;
}
