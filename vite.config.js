import { defineConfig } from 'vite';

export default defineConfig({
  // Static single-page app. Keep the build output simple and predictable.
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
