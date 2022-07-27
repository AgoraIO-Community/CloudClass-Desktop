import React from 'react';
import { FcrTheme, ThemeProvider } from '../src/components/theme';

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
};


export const decorators = [(Story) => <ThemeProvider value={theme}>{Story()}</ThemeProvider>];
