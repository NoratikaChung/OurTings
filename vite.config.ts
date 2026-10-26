/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'OurTings',
        short_name: 'OurTings',
        description: 'Our shared calendar',
        lang: 'en',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        background_color: '#06101F',
        theme_color: '#06101F',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // icon.png is only the source for the generated icons; don't make phones cache it.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'], globIgnores: ['icon.png'] },
    }),
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { target: 'es2022' },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
