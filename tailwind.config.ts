import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest-bg': '#121412',
        'forest-card': '#1E211E',
        'forest-text': '#F0F0F0',
        'forest-left': '#2ECC71',
        'forest-right': '#E67E22',
      },
    },
  },
  plugins: [],
}
export default config

