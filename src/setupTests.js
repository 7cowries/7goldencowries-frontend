// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock matchMedia for tests that rely on it
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  const proto = window.HTMLMediaElement.prototype;
  Object.defineProperty(proto, 'load', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(proto, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(proto, 'pause', {
    configurable: true,
    value: jest.fn(),
  });
}
