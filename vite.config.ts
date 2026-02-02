import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
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
