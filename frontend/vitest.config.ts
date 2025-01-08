// frontend/vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            reporter: ['text', 'lcov'], // 必要に応じて html など他のフォーマットも
            lines: 80,    // カバレッジ閾値の例 (行)
            functions: 80,
            branches: 80,
            statements: 80,
        },
        setupFiles: ['./setupVitest.ts'], // 後述
    },
})
