import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // El scaffold de Vite y el arranque no son codigo a cubrir: main.tsx
      // solo monta el arbol, y App.tsx se borra con la primera pantalla real.
      exclude: ['src/main.tsx', 'src/setupTests.ts', 'src/**/*.d.ts'],
      // Sin thresholds todavia: hoy src/ es scaffold y un umbral aca pinearia
      // un numero que mide codigo condenado. Entra con la primera pantalla.
    },
  },
})
