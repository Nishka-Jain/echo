import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        fontFamily: {
          sans: ['var(--font-lato)', 'sans-serif'],
          serif: ['var(--font-playfair-display)', 'serif'],
        },
    },
  },
  plugins: [
    typography,
  ],
};
export default config;
