/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        dmo: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          dark: '#0f172a',
          darker: '#020617',
        },
        seal: {
          normal: '#3B82F6',     // Azul
          bronze: '#CD7F32',     // Bronce
          silver: '#9CA3AF',     // Plata
          gold: '#F59E0B',       // Oro
          platinum: '#14B8A6',   // Platino/Turquesa
          master: '#A855F7',     // Púrpura Master
        },
        category: {
          at: '#ef4444',
          ct: '#f59e0b',
          ht: '#10b981',
          hp: '#ec4899',
          ds: '#6366f1',
          de: '#3b82f6',
          bl: '#14b8a6',
          ev: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color, rgba(99, 102, 241, 0.4))' },
          '50%': { boxShadow: '0 0 30px var(--glow-color, rgba(99, 102, 241, 0.6))' },
        },
      },
    },
  },
  plugins: [],
}
