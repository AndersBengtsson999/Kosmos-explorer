import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({
  plugins:[react()],
  optimizeDeps:{include:['three-stdlib']},
  server:{watch:mode === 'e2e' ? null : undefined},
}));
