import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // SW is registered via `useRegisterSW` (see `src/components/ReloadPrompt.jsx`)
      injectRegister: null,
      includeAssets: ['logo.png', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'PrepZone - JECA Prep Tracker',
        short_name: 'PrepZone',
        description: 'JECA exam preparation tracker with analytics, mistake logging, and revision management.',
        theme_color: '#ef4444',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/practice\/[a-f0-9]+\/submit/,
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'mcq-submit-queue',
                options: {
                  maxRetentionTime: 24 * 60 // retry for up to 24 hours
                }
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
