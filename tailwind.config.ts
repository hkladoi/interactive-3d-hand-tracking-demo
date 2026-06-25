import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        glow: "0 0 36px rgba(45, 212, 191, 0.28)",
        panel: "0 20px 60px rgba(0, 0, 0, 0.35)"
      },
      keyframes: {
        "hologram-scan": {
          "0%": { transform: "translateY(-90%)" },
          "100%": { transform: "translateY(260%)" }
        },
        "slow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "hologram-scan": "hologram-scan 3.6s linear infinite",
        "slow-spin": "slow-spin 16s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
