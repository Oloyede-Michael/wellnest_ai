/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        slate: {
          DEFAULT: "#5B6472",
          light: "#8890A0",
        },
        canvas: "#F3F5FA",
        mist: "#E3E7F0",
        indigo: {
          DEFAULT: "#2C49C0",
          deep: "#1B2F86",
          soft: "#EEF1FC",
        },
        meadow: {
          DEFAULT: "#2E9B4F",
          soft: "#E7F5EA",
          deep: "#1F7A3B",
        },
        amber: {
          DEFAULT: "#DB9A2C",
          soft: "#FBF1DF",
        },
        coral: {
          DEFAULT: "#D5473D",
          soft: "#FBEAE8",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px",
        xl: "22px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20, 23, 31, 0.04)",
        float: "0 12px 32px -12px rgba(28, 41, 90, 0.28)",
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
}

