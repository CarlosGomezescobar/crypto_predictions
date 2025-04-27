/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Azul principal
        secondary: '#6B7280', // Gris secundario
        success: '#10B981', // Verde éxito
        danger: '#EF4444', // Rojo peligro
        warning: '#F59E0B', // Naranja advertencia
        info: '#3B82F6', // Azul información
      },
    },
  },
  plugins: [],
};