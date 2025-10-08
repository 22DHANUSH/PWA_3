import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 5 MB
      },
      manifest: {
        name: "CH-Ecom",
        short_name: "EcomApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "columbialogo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "columbialogo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "MyLogo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
