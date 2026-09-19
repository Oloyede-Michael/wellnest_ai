import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'nim', 'NIM'],
    server: {
      proxy: {
        '/api/nim': {
          target: 'https://integrate.api.nvidia.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nim/, ''),
        },
      },
    },
    define: {
      'process.env': JSON.stringify(env),
    },
  };
});

