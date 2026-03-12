/** @type {import('tailwindcss').Config} */
const { colors: tokenColors } = require('@jrmst102/shared-config');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@jrmst102/ui-kit/dist/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: tokenColors.primary,
        gray: tokenColors.neutral,
      },
    },
  },
  plugins: [],
}

