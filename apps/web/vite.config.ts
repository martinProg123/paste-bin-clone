import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { tanstackRouter } from '@tanstack/router-vite-plugin';

export default defineConfig(({ mode }) => {
  // Load env from the monorepo root (two levels up)
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter(),
      react(),
    ], 
    // resolve: {
    //   alias: {
    //     "@": path.resolve(__dirname, "./src"),
    //   },
    // },
    envDir: '../../',
    server: {
      port: Number(env.VITE_PORT) || 4613,
      strictPort: true, // Fail if port is already in use
    },
  };
});