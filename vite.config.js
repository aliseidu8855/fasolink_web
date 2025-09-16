/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwaDescription = 'FasoLink: Plateforme pour vendre et acheter rapidement des produits en toute confiance.'

// Re-usable brand colors (should mirror CSS tokens where practical)
const themeColor = '#DE0000'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'logo.svg'],
      manifest: {
        name: 'FasoLink',
        short_name: 'FasoLink',
        description: pwaDescription,
        theme_color: themeColor,
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        dir: 'ltr',
        orientation: 'portrait-primary',
        icons: [
          { src: '/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /.*\.(png|jpg|jpeg|gif|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            }
          },
          {
            urlPattern: /https:\/\/[^/]*api[^/]*\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        navigateFallback: '/index.html'
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['fasolink-web.onrender.com'],
  },
})
