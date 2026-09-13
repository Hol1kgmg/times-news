import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#': '/src',
      '@': '/src',
    },
  },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // TODO: 最初のテストを追加した時点でこの行を削除する。
    // 有効なままだとテストが 0 件でも `vitest run` が成功し、CI の test job が
    // 何も検証していない状態になる（2026-09-13 に実際に発生）。
    passWithNoTests: true,
    globals: false,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/index.{ts,tsx}',
        'src/routeTree.gen.ts',
        'src/**/*.d.ts',
      ],
    },
  },
})
