/** @type {import('tailwindcss').Config} */
const { colors: tokenColors } = require('./src/ui/tokens.json');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
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
