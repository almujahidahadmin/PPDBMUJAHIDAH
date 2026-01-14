import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Menggunakan path relatif agar fleksibel untuk nama repo apapun (case-insensitive)
});