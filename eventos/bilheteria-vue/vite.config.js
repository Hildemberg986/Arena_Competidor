// vite.config.js
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), "");
  const base = env.VITE_BASE_URL || "/eventos/bilheteria/";

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        // Não gera manifesto (usamos os nossos personalizados)
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,webp}"],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      }),
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