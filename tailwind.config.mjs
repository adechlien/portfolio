import adech from "@adech/themes/superior/preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [adech],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cascadia: ['Cascadia Code Variable', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      keyframes: {
        tabEnter: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: { tabEnter: 'tabEnter 420ms cubic-bezier(0.22, 1, 0.36, 1)' },
    },
    fontFamily: { bellota: ['Bellota Text', 'sans-serif'] },
  },
  plugins: [],
};
