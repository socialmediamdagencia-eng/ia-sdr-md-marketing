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
        ink: "#17202A",
        graphite: "#25313D",
        mist: "#F6F8FA",
        line: "#DFE5EB",
        teal: "#0F766E",
        coral: "#D25A43",
        amber: "#B7791F"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
