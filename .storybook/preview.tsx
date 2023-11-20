import React from 'react';
import { FcrTheme, ThemeProvider } from 'agora-common-libs';
import '../src/ui-kit/styles/global.css';

const theme: FcrTheme = {
  /**
   * 背景色
   */
  background: '#f9f9fc',
  /**
   * 前景色
   */
  foreground: '#ffffff',
  /**
   * 组件背景色
   */
  brand: '#357bf6',
  /**
   * 分割线颜色
   */
  divider: '#eeeef7',
  /**
   * 错误提示颜色
   */
  error: '#f5655c',
  /**
   * 警告提示色
   */
  warning: '#ffb554',
  /**
   * 一般提示色
   */
  safe: '#64bb5c',
  /**
   * Icon 主色
   */
  iconPrimary: 'black',
  /**
   * Icon 副色
   */
  iconSecondary: '#ccc',
  /**
   * 图标被选背景色
   */
  iconSelected: '#F7F7FA',
  /**
   * 组件背景色
   */
  component: '#ffffff',
  toastNormal: '#4E90FE',
  textPrimaryButton: '#ffffff',
  textLevel1: '#191919',
  textLevel2: '#586376',
  textLevel3: '#7b88a0',
  textDisable: '#bdbdca',
  textLink: '#357bf6',
  // v2
  v2Block1: '',
  v2Block2: '',
  v2Block3: '',
  v2Block4: '',
  v2Block5: '',
  v2Block6: '',
  v2Block7: '',
  v2Block8: '',
  v2Line1: '',
  v2Text1: '',
  v2Text2: '',
  v2Text3: '',
  v2Icon1: '',
  v2Icon2: '',
  v2Hover: '',
  v2Shadow1: '',
  v2Shadow2: '',
  v2Shadow3: '',
  v2Essential: '',
  v2EssentialInverse: '',
};

export const jumpToLine = (str: string) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export const applyTheme = (theme: FcrTheme) => {
  let cssString = '';

  for (const colorName in theme) {
    cssString += `--fcr_system_${jumpToLine(colorName)}_color: ${theme[colorName]};`;
  }

  const fcrGlobalStyleSheetId = 'theme-sheet';

  const fcrStyleSheet = document.querySelector(`#${fcrGlobalStyleSheetId}`);
  if (fcrStyleSheet) {
    fcrStyleSheet.textContent = `:root{
      ${cssString}
    }`;
  } else {
    const newStyleSheet = document.createElement('style');
    newStyleSheet.id = fcrGlobalStyleSheetId;
    newStyleSheet.textContent = `:root{
      ${cssString}
    }`;
    document.head.appendChild(newStyleSheet);
  }
};

export const decorators = [
  (Story) => {
    applyTheme(theme);
    return <ThemeProvider value={theme}>{Story()}</ThemeProvider>;
  },
];
