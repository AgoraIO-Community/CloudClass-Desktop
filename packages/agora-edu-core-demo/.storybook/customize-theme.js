import { create } from '@storybook/theming';
import CloudClassSymbol from '../public/favicon.png';

export const theme = create({
  base: 'light',
  brandTitle: 'CloudClass UI Preview',
  // brandUrl: 'https://github.com/agoraio-community/CloudClass-Desktop.git',
  fontBase: "'helvetica neue', 'arial', 'PingFangSC', 'microsoft yahei'",
  fontCode: 'microsoft yahei',
});