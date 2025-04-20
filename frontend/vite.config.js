import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import forms from '@tailwindcss/forms'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: [
          "./src/**/*.{js,jsx,ts,tsx}", // Make sure this exists
        ],
        theme: {
          extend: {},
        },
        plugins: [forms()],
      },
    }),
  ],
  
})

