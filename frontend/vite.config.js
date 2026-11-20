import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// =====================================================
// base: './' ← مسارات نسبية تعمل في مجلد فرعي على cPanel وداخل برنامج exe
// PWA ← يحفظ الواجهة وملفات البيانات (نحو 9 ميغابايت) للعمل دون إنترنت
// =====================================================
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'جمّل - منصة الدراسة العددية للقرآن',
        short_name: 'جمّل',
        description: 'حساب الجمّل والجداول والأوفاق ودراسة الأرقام والقرآن الكريم، يعمل دون إنترنت',
        lang: 'ar',
        dir: 'rtl',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        icons: [
          {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
          {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png'},
          {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,json}'],
        // ملف الآيات وحده نحو 7 ميغابايت
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        navigateFallback: 'index.html'
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1500
  },
  server: {
    proxy: {
      // الخادم الاختياري (npm run server) إن احتيج لاختبار الـ API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
