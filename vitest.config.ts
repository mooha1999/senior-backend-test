import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 10000,
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@infra': path.resolve(__dirname, 'src/infra'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@middleware': path.resolve(__dirname, 'src/middleware'),
      '@config': path.resolve(__dirname, 'src/config'),
      'types': path.resolve(__dirname, 'src/types'),
    },
  },
});
