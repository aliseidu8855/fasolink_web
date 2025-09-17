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
      // Use generateSW to avoid inject-manifest build errors and keep things simple.
      // We'll keep it online-only by not precaching any app shell files.
      strategies: 'generateSW',
      workbox: {
        globPatterns: [], // don't precache built assets; stay online-only
        navigateFallback: null, // no offline fallback routing
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
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
          { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/favicon-196.png', sizes: '196x196', type: 'image/png' }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['fasolink-web.onrender.com'],
  },
})
