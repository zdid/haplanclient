import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: false, // Désactiver la minification pour le développement
    sourcemap: true, // Générer des source maps pour le débogage
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/App.ts'),
      },
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames: 'assets/[name].[ext]',
        // Désactiver la compression dans les options de sortie
        compact: false,
      },
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});