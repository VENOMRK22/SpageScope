/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#050507',
        'starlight-white': '#EAEAEA',
        'muted-gray': '#8892B0',
        'neon-cyan': '#00F3FF',
        'hologram-blue': '#2D5873',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-glow': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'deep-space': 'linear-gradient(to bottom, #050507, #0a0e17)',
      },
    },
  },
  plugins: [],
}
