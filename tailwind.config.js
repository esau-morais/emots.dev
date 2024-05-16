/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        cursor: 'cursor .6s linear infinite alternate',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        cursor: {
          '0%, 40%': { opacity: 1 },
          '65%, 100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      defaultFlavour: 'mocha',
    }),
  ],
}
