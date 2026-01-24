import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Buddha-Chant/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: '靜心念佛 - Zen Chanting Counter',
        short_name: '靜心念佛',
        description: '優雅的念佛計數應用程式，支援雲端自動備份',
        theme_color: '#d4a373',
        background_color: '#fdfbf7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Buddha-Chant/',
        start_url: '/Buddha-Chant/',
        icons: [
          {
            src: '/Buddha-Chant/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Buddha-Chant/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Buddha-Chant/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
