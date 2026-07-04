// vite.config.js
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), '');
  const base = env.VITE_BASE_URL || '/eventos/bilheteria/';
  
  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'img/**/*'],
        manifest: {
          name: 'Arena Competidor - Bilheteria Digital',
          short_name: 'Arena Competidor',
          description: 'Bilheteria digital para eventos esportivos',
          theme_color: '#e62117',
          background_color: '#f8fafc',
          display: 'standalone',
          scope: base,
          start_url: `${base}#/`,
          icons: [
            {
              src: `${base}#/public/icons/icon-192x192.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `${base}#/public/icons/icon-512x512.png`,
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: `${base}#/public/icons/icon-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,jpg,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 300 }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: base,
    envDir: path.resolve(__dirname, "../../"),
    build: {
      outDir: "../bilheteria",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          assetFileNames: "assets/[name].[hash].[ext]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
        },
      },
    },
    server: {
      port: 8080,
    },
  };
});