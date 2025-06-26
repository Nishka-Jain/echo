import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        fontFamily: {
          sans: ['var(--font-manrope)', 'sans-serif'], // Sets Manrope as the default body font
          serif: ['Lora', 'serif'],      // Sets Lora as the default headline font
        },
    },
  },
  // Add the plugins section with the new plugin
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;