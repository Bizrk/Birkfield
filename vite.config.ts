import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@birkfield/core': resolve(__dirname, './packages/birkfield-core/src/index.ts')
    }
  }
});
