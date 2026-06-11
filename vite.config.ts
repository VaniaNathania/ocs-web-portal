import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "tailwindcss";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASE_URL || "/",

    plugins: [react()],

    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    build: {
      target: "es2020",
      sourcemap: false,
      brotliSize: false,

      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            mui: ["@mui/material", "@mui/utils"],
            radix: ["@radix-ui/react-context-menu"],
            xyflow: ["@xyflow/react"],
            charts: ["apexcharts", "react-apexcharts"],
            maps: ["leaflet", "react-leaflet"],
            motion: ["framer-motion"],
            editor: ["react-quill"],
          },
        },
      },
    },

    server: {
      proxy: {
        "/api-offer": {
          target: env.VITE_APP_API_URL_OFFER || "http://147.139.247.189:8081",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-offer/, "/api"),
        },

        "/api": {
          target: env.VITE_APP_API_URL || "http://147.139.247.189:8080",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },

        "/api/event": {
          target: env.VITE_APP_API_URL_EVENT || "http://147.139.247.189:8087",
          changeOrigin: true,
        },
      },
    },
  };
});
