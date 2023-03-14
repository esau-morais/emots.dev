/** @type {import('tailwindcss').Config} */

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space_grotesk)'],
      },
    },
    animation: {
      cursor: 'cursor .6s linear infinite alternate',
    },
    keyframes: {
      cursor: {
        '0%, 40%': { opacity: 1 },
        '65%, 100%': { opacity: 0 },
      },
    },
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      defaultFlavour: 'mocha',
    }),
    require('@tailwindcss/line-clamp'),
  ],
}
