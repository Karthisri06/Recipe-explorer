module.exports = {
  content: ["./index.html","./*.html", "./**/*.html",],
  theme: {
    extend: {
      backgroundImage: {
        'pattern': "url('/assests/bg.jpg')",
      },
      fontFamily: {
        serif: ['"DM Serif Text"', 'serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        'custom-orange': '#e36724',
      },
      typography: {
        DEFAULT: {
          css: {
            h4: {
              fontWeight: '700', // Bold
            },
          },
        },
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

