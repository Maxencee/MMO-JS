import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/ui/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
