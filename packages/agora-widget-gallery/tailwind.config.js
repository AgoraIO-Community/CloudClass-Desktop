const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  colors: {
    gray: colors.coolGray,
    blue: '#357BF6',
    red: colors.rose,
    pink: colors.fuchsia,
  },
  theme: {
    extend: {
      backgroundColor: {
        primary: '#357BF6',
        'primary-hover': '#639AFA',
        'primary-active': '#2663D0',
        'table-header': '#F9F9FC',
        'table-body': '#FFFFFF',

        // 'download-fg': '#456DFD',
        // 'download-bg': '#E3E3F0',

        success: '#FAFFFF',
        error: '#FFF2F2',
        warning: '#FFFBF4',
      },
      borderColor: {
        danger: '#DE5753',
        'danger-hover': '#F56F6B',
        'danger-active': '#C02621',

        secondary: '#D2D2E2',
        'secondary-hover': '#639AFA',
        'secondary-active': '#2663D0',

        table: '#E3E3EC',
        'table-bottom': '#E3E3EC',
        success: '#357BF6',
        error: '#F07766',
        warning: '#F0C996',
      },
      textColor: {
        primary: '#357BF6',
        'primary-hover': '#639AFA',
        'primary-active': '#2663D0',
        danger: '#DE5753',
        'danger-hover': '#F56F6B',
        'danger-active': '#C02621',
        secondary: '#357BF6',
        'secondary-hover': '#639AFA',
        'secondary-active': '#2663D0',
        ghost: '#677386',
      },
    },
    fontFamily: {
      scenario: ['helvetica neue', 'arial', 'PingFangSC', 'microsoft yahei'],
    },
  },
  variants: {
    backgroundColor: ['hover', 'active'],
    extend: {
      opacity: ['disabled'],
    },
  },
  // plugins: [
  //   require('@tailwindcss/forms')
  // ],
};
