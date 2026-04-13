import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
   plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['icon.ico', 'icon.png', 'logo.svg', 'bg-paper.jpg'],
         manifest: {
            name: 'Recaos - Lista de la compra',
            short_name: 'Recaos',
            description: 'Tu lista de la compra sincronizada en todos tus dispositivos',
            theme_color: '#f5f5dc',
            background_color: '#e2e8f0',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
               { src: '/icon.png', sizes: '192x192', type: 'image/png' },
               { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
            ],
         },
         workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
                  handler: 'NetworkFirst',
                  options: { cacheName: 'firestore-cache' },
               },
            ],
         },
      }),
   ],
});
