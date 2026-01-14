import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PPDBMUJAHIDAH/', // Penting: Sesuaikan dengan nama repository GitHub untuk deployment yang benar
});