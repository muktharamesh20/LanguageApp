/** @type {import('tailwindcss').Config} */
const textSize = 14; //range 14-20
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        'xs': [`${textSize * 0.75}px`, { lineHeight: `${textSize * 1}px` }], // 75% of base size
        'sm': [`${textSize * 0.875}px`, { lineHeight: `${textSize * 1.25}px` }], // 87.5% of base size
        'md': [`${textSize}px`, { lineHeight: `${textSize * 1.5}px` }], // Base size
        'base': [`${textSize}px`, { lineHeight: `${textSize * 1.5}px` }], // Base size
        'lg': [`${textSize * 1.125}px`, { lineHeight: `${textSize * 1.75}px` }], // 112.5% of base size
        'xl': [`${textSize * 1.25}px`, { lineHeight: `${textSize * 2}px` }], // 125% of base size
        '2xl': [`${textSize * 1.5}px`, { lineHeight: `${textSize * 3}px` }], // 150% of base size
        '3xl': [`${textSize * 2}px`, { lineHeight: `${textSize * 3.33}px` }], // 200% of base size
        '4xl': [`${textSize * 2.5}px`, { lineHeight: `${textSize * 3.67}px` }], // 250% of base size
        '5xl': [`${textSize * 3}px`, { lineHeight: `${textSize * 4.67}px` }], // 300% of base size
        '6xl': [`${textSize * 4}px`, { lineHeight: `${textSize * 6}px` }], // 400% of base size
        '7xl': [`${textSize * 5}px`, { lineHeight: `${textSize * 7.33}px` }], // 500% of base size
        '8xl': [`${textSize * 6}px`, { lineHeight: `${textSize * 8.67}px` }], // 600% of base size
        '9xl': [`${textSize * 8}px`, { lineHeight: `${textSize * 9.33}px` }], // 800% of base size
      },
      aspectRatio: {
        '2/3': '2 / 3',
        '3/4': '3 / 4',
        '3/5': '3 / 5',
        '9/16': '9 / 16',
        '9/21': '9 / 21',
      },
      colors: {
        primary: '#F9F8F5',
        secondary: '#0E2433',
        priority: {
          100:'#ED4756',
          200:'#FF8C3A',
          300: '#F0BB00',
          400: '3898F3',
        },
        light: {
          100: "DADADA",
          200: '#C4C4C4',
          300: '#ADB5BA',
        },
        darkBlues: {
          100: '3898F3',
          200: '21598C',
          300: '#1A466D',
        },
        accent: '#21598B',
        divider: '#E4E4E4',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
