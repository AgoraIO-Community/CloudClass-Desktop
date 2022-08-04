module.exports = {
  purge: ['./src/**/*.{ts,tsx}', '../agora-scenario-ui-kit/src/**/*.{ts,tsx}'],
  darkMode: 'class', // or 'media' or 'class'

  theme: {
    extend: {
      backgroundColor: {
        background: 'var(--fcr_system_background_color)',
        foreground: 'var(--fcr_system_foreground_color)',
        brand: 'var(--fcr_system_brand_color)',
        error: 'var(--fcr_system_error_color)',
        warning: 'var(--fcr_system_warning_color)',
        safe: 'var(--fcr_system_safe_color)',
        'icon-selected-color': 'var(--fcr_system_icon_selected_color)',
        'icon-selected-hover-color': 'var(--fcr_system_icon_selected_color)',
        component: 'var(--fcr_system_component_color)',
        'toast-normal': 'var(--fcr_system_toast_normal_color)',
      },
      borderColor: {
        divider: 'var(--fcr_system_divider_color)',
        brand: 'var(--fcr_system_brand_color)',
        component: 'var(--fcr_system_component_color)',
        background: 'var(--fcr_system_background_color)',
        error: 'var(--fcr_system_error_color)',
        warning: 'var(--fcr_system_warning_color)',
        safe: 'var(--fcr_system_safe_color)',
        'toast-normal': 'var(--fcr_system_toast_normal_color)',
      },

      textColor: {
        level1: 'var(--fcr_system_text_level1_color)',
        level2: 'var(--fcr_system_text_level2_color)',
        level3: 'var(--fcr_system_text_level3_color)',
        disable: 'var(--fcr_system_text_disable_color)',
        brand: 'var(--fcr_system_brand_color)',
        error: 'var(--fcr_system_error_color)',
        warning: 'var(--fcr_system_warning_color)',
        safe: 'var(--fcr_system_safe_color)',
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
};
