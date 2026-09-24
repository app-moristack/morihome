import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'
import laravel from 'laravel-vite-plugin'

const THEME_COLOR = '#F5C518'
const BACKGROUND_COLOR = '#171717'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/main.tsx'],
      refresh: ['routes/**', 'resources/views/**'],
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      outDir: 'public',
      filename: 'sw.js',
      manifestFilename: 'manifest.webmanifest',
      manifest: {
        name: 'MoriHome — Construction & Renovation Directory',
        short_name: 'MoriHome',
        description:
          'Find trusted construction, renovation and home-service professionals near you in Mauritius.',
        lang: 'en',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        categories: ['business', 'utilities'],
        icons: [
          { src: '/icons/icon-64.png', sizes: '64x64', type: 'image/png' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Search professionals', url: '/search', description: 'Find a nearby professional' },
          { name: 'Join the directory', url: '/register', description: 'Register as a provider' },
        ],
      },
      workbox: {
        globDirectory: 'public',
        globPatterns: [
          'build/assets/**/*.{js,css,woff2}',
          'icons/*.png',
          'offline.html',
          'offline-language.js',
          'favicon.ico',
        ],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' && !/^\/(api|sanctum|storage)(\/|$)|^\/up$/.test(url.pathname),
            handler: 'NetworkOnly',
            options: {
              precacheFallback: { fallbackURL: '/offline.html' },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/storage/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'morihome-media',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname === '/api/v1/categories',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'morihome-categories' },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'resources/js') },
  },
  server: {
    watch: { ignored: ['**/storage/framework/views/**'] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./resources/js/test/setup.ts'],
    include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
})
