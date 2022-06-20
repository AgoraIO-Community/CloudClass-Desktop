import { WebviewWidget } from './sub-widget/webview/webview';

export enum AgoraWidgetType {
  POPUP = 'POPUP',
  PLUGIN = 'PLUGIN',
}
export interface AgoraWidgetConfig {
  type: AgoraWidgetType;
  instance: unknown;
}

export enum AgoraWidgetPrefix {
  Webview = 'webView',
}
export const WidgetsConfigMap: Record<AgoraWidgetPrefix, AgoraWidgetConfig> = {
  [AgoraWidgetPrefix.Webview]: {
    type: AgoraWidgetType.POPUP,
    instance: WebviewWidget,
  },
};
export enum AgoraWidgetCustomEventType {
  WidgetReload = 'WidgetReload',
}
