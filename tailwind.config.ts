import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
          // --- Light Theme Palette ---
          'light-bg': '#F7F8FC',      // Soft off-white background
          'light-card': '#FFFFFF',    // Pure white for cards
          'light-border': '#EAEBF1',  // Subtle border color
          'text-primary': '#1A202C',  // Dark grey for main text
          'text-secondary': '#718096',// Lighter grey for descriptions

          // --- Accent Colors (can remain the same) ---
          'accent-purple': '#4A3AFF',
          'accent-yellow': '#FAE27C',
          'accent-skyblue': '#C3EBFA',
          'accent-green': '#00F5A0',


        kungkeaSky: "#C3EBFA",
        kungkeaSkyLight: "#EDF9FD",
        kungkeaPurple: "#CFCEFF",
        kungkeaPurpleLight: "#F1F0FF",
        kungkeaYellow: "#F26522",
        kungkeaYellowLight: "#FEFCE8",
        orangeCustom: '#F26522',
        kungkeaGreen: '#6fd943',
        kungkeaGreenishColor: '#3ec9d6',
        kungkeaRedColor: '#ff3a6e',
      },
      animation: {
        'modal-popin': 'modalPopIn 0.3s ease-out forwards',
      },
      keyframes: {
        modalPopIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
