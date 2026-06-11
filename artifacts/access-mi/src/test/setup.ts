import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as vitestAxeMatchers from "vitest-axe/matchers";
expect.extend(vitestAxeMatchers);

const _storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => _storage[key] ?? null,
  setItem: (key: string, value: string) => {
    _storage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete _storage[key];
  },
  clear: () => {
    Object.keys(_storage).forEach((k) => delete _storage[k]);
  },
  get length() {
    return Object.keys(_storage).length;
  },
  key: (i: number) => Object.keys(_storage)[i] ?? null,
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});
