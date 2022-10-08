import { Index_URL } from './url';

// 跳转到登出
export function historyPushLogout(): void {
  history.pushState({}, '', `${Index_URL}/#/logout`);
}

// 跳转到首页
export function historyPushHome(): void {
  history.pushState({}, '', Index_URL);
}
