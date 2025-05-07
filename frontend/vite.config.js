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
          extend: {fontFamily: {
            poppins: ['Poppins', 'sans-serif'],
          },fontSize: {
            'xs': '0.75rem',     // 12px at base font size
            'sm': '0.875rem',    // 14px at base font size
            'base': '1rem',      // 16px at base font size
            'lg': '1.125rem',    // 18px at base font size
            'xl': '1.25rem',     // 20px at base font size
            '2xl': '1.5rem',     // 24px at base font size
            '3xl': '1.875rem',   // 30px at base font size
            '4xl': '2.25rem',    // 36px at base font size
          },
          // Custom spacing using rem units
          spacing: {
            // Add custom spacing values if needed
          },
          // Optional: Add container constraints
          container: {
            center: true,
            padding: {
              DEFAULT: '1rem',
              sm: '2rem',
              lg: '4rem',
              xl: '5rem',
            },
          },}
          ,  // Override default breakpoints if needed
          screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
          },
        },
        plugins: [forms()],
      },
    }),
  ],
  
})

