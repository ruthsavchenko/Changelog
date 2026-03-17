/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // On GitHub Pages the app lives at /REPO_NAME/, not /
  // GITHUB_PAGES is set explicitly only in the Pages build job (not in E2E)
  base: process.env.GITHUB_PAGES
    ? `/${process.env.GITHUB_REPOSITORY!.split('/')[1]}/`
    : '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
