import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0f172a',
          surface: '#1e293b',
          deep: '#020617',
        },
        border: {
          DEFAULT: '#334155',
          strong: '#475569',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '24px',
        btn: '12px',
      },
      keyframes: {
        'status-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.9)' },
        },
        'progress-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(59,130,246,0.9)' },
        },
      },
      animation: {
        'status-pulse': 'status-pulse 2s infinite ease-in-out',
        'progress-glow': 'progress-glow 3s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
