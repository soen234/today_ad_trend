/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // 브랜드 토큰 (설계 문서 §8). 기본 팔레트 이름과 겹치지 않게 ink/signal만 추가한다.
      colors: {
        ink: {
          DEFAULT: '#0B1B2B',
          950: '#06111C',
          900: '#0B1B2B',
          800: '#10263B',
          700: '#1A344D',
          600: '#24425C',
        },
        signal: {
          DEFAULT: '#12B76A',
          50: '#ECFDF3',
          100: '#D1FADF',
          500: '#12B76A',
          600: '#039855',
          700: '#027A48',
        },
      },
    },
  },
  plugins: [],
};
