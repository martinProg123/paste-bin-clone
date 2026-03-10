import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from the monorepo root (two levels up)
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');

  return {
    plugins: [react(),
    tailwindcss(),],
    server: {
      port: parseInt(env.VITE_PORT) || 4613,
      strictPort: true, // Fail if port is already in use
    },
  };
});