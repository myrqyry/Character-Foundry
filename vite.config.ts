import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
    return {
      test: {
        exclude: ['**/node_modules/**', '**/e2e/**'],
        environment: 'jsdom',
        globals: true,
      },
      build: {
        rollupOptions: {
          // external: ['react-hot-toast'],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
