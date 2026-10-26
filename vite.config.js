import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In the Base44 sandbox the preview reaches the dev server through
// <port>-<sandbox id>.<sandbox host domain>. Only widen the host allowlist
// when BASE44_PREVIEW_MODE is exactly "1"; otherwise the default behaviour
// (localhost only) is preserved.
const allowedHosts =
  process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_SANDBOX_HOST_DOMAIN
    ? ['localhost', '127.0.0.1', `.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`]
    : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(allowedHosts ? { allowedHosts } : {}),
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://api:3001',
        changeOrigin: true,
      },
    },
  },
});
