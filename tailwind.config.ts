import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#060A16",
        graphite: "#101A33",
        mist: "#F4F6FB",
        line: "#D8DEF0",
        teal: "#486DFF",
        coral: "#D25A43",
        amber: "#B7791F"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(6, 10, 22, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
