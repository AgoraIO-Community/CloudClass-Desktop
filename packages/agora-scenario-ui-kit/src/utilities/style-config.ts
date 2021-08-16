/**
 * antd zIndex rules
 * @zindex-badge: auto;
 * @zindex-table-fixed: 2;
 * @zindex-affix: 10;
 * @zindex-back-top: 10;
 * @zindex-picker-panel: 10;
 * @zindex-popup-close: 10;
 * @zindex-modal: 1000;
 * @zindex-modal-mask: 1000;
 * @zindex-message: 1010;
 * @zindex-notification: 1010;
 * @zindex-popover: 1030;
 * @zindex-dropdown: 1050;
 * @zindex-picker: 1050;
 * @zindex-popoconfirm: 1060;
 * @zindex-tooltip: 1070;
 * @zindex-image: 1080;
 *
 * agora zIndex rule
 * @zindex-ext-app: 998
 */

export const Z_INDEX_RULES: {
  zIndexBadge: 'auto';
  zIndexTableFixed: number;
  zIndexAffix: number;
  zIndexBackTop: number;
  zIndexPickerPanel: number;
  zIndexPopupClose: number;
  zIndexModal: number;
  zIndexModalMask: number;
  zIndexMessage: number;
  zIndexNotification: number;
  zIndexPopover: number;
  zIndexDropdown: number;
  zIndexPicker: number;
  zIndexPopoconfirm: number;
  zIndexTooltip: number;
  zIndexImage: number;
  zIndexExtApp: number;
} = {
  zIndexBadge: 'auto',
  zIndexTableFixed: 2,
  zIndexAffix: 10,
  zIndexBackTop: 10,
  zIndexPickerPanel: 10,
  zIndexPopupClose: 10,
  zIndexModal: 1000,
  zIndexModalMask: 1000,
  zIndexMessage: 1010,
  zIndexNotification: 1010,
  zIndexPopover: 1030,
  zIndexDropdown: 1050,
  zIndexPicker: 1050,
  zIndexPopoconfirm: 1060,
  zIndexTooltip: 1070,
  zIndexImage: 1080,
  zIndexExtApp: 998,
} as const;

/**
 * 一些颜色的定义
 */
export const COLOR_RULES: {
  activeColor: string;
  deactiveColor: string;
} = {
  activeColor: '#357BF6',
  deactiveColor: '#7B88A0',
};
