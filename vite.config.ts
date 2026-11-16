import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // face.worker.ts uses ES module imports. Keep the worker as an ESM bundle
  // in both development and production.
  worker: { format: 'es' },
  build: { target: 'es2022', chunkSizeWarningLimit: 650, manifest: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: { reporter: ['text', 'html'] },
  },
});
