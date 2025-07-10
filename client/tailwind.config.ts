import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          0: "#ffffff",
          100: "#D8E4FD",
          200: "#AEC8FC",
          300: "#85A8F8",
          400: "#65BDF1",
          500: "#3563E9",
          600: "#2648C8",
          700: "#1A37A7",
          800: "#102587",
          900: "#0A196F",
        },

        success: {
          100: "#F5FCD2",
          200: "#E8FAA6",
          300: "#D3F178",
          400: "#BCE455",
          500: "#9CD323",
          600: "#7FEB19",
          700: "#659711",
          800: "#4C7A08",
          900: "#386506",
        },

        error: {
          100: "#FFE7D3",
          200: "#FFC8A6",
          300: "#FFA37A",
          400: "#FF7F59",
          500: "#FF4423",
          600: "#DB2719",
          700: "#B71112",
          800: "#930B16",
          900: "#7A0619",
        },

        warning: {
          100: "#FFF8D7",
          200: "#FFF0B0",
          300: "#FFE488",
          400: "#FFD96B",
          500: "#FFC73A",
          600: "#DBA32A",
          700: "#B7821D",
          800: "#936312",
          900: "#7A4D0B",
        },

        info: {
          100: "#DCF3FF",
          200: "#BAE5FF",
          300: "#98D3FF",
          400: "#7EC2FF",
          500: "#54A6FF",
          600: "#3D81DB",
          700: "#2A60B7",
          800: "#1A4393",
          900: "#102E7A",
        },

        secondary: {
          100: "#E0E9F4",
          200: "#C3D4E9",
          300: "#90A3BF",
          400: "#596780",
          500: "#1A202C",
          600: "#131825",
          700: "#0D121F",
          800: "#080C19",
          900: "#040815",
        },
      },

      fontSize: {
        "text-xs": ["12px", "auto"],
        "text-sm": ["14px", "140%"],
        "text-base": ["16px", "140%"],
        "text-lg": ["18px", "145%"],
        "text-xl": ["20px", "145%"],
        "text-2xl": ["24px", "150%"],
        "text-3xl": ["32px", "150%"],
        "text-4xl": ["40px", "160%"],
        "text-5xl": ["72px", "105%"],
      },

      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
  },
  plugins: [],
};

export default config;
