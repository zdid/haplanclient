// Configuration pour les tests
import { expect } from 'vitest';
import { vi } from 'vitest';

// Configurer un environnement DOM minimal pour les tests qui n'ont pas besoin d'un vrai DOM
const mockDocument = {
  createElement: vi.fn((tagName: string) => ({
    className: '',
    style: {},
    textContent: '',
    innerHTML: '',
    setAttribute: vi.fn(),
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    remove: vi.fn(),
    querySelector: vi.fn(() => null),
  })),
  querySelector: vi.fn(() => null),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

global.document = mockDocument as unknown as Document;

// Mock pour window
global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  document: mockDocument,
} as any;

// Mock pour navigator
global.navigator = {
  userAgent: 'Node.js',
};

// Étendre les matchers de Vitest
expect.extend({
  toBeConnected(received: any) {
    const isConnected = received.isConnected && received.isConnected();
    return {
      pass: isConnected,
      message: () => `expected ${received.constructor.name} to be connected`,
    };
  },
});