import "@testing-library/jest-dom/vitest"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", { writable: true, value: ObserverStub })
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: ObserverStub })
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { writable: true, value: () => undefined })
Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { writable: true, value: () => undefined })
Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { writable: true, value: () => undefined })
Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { writable: true, value: () => false })
