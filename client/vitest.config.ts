import { defineConfig } from 'vitest/config';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // Configuration pour les tests unitaires
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/test-setup.ts',
        '**/vitest.config.ts',
      ],
    },
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
    // Mock des modules si nécessaire
    mockReset: true,
    restoreMocks: true,
    // Ajouter une configuration pour les tests qui échouent
    retry: 1,
    // Timeout plus long pour les tests
    testTimeout: 10000,
  },
});