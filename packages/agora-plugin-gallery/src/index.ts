import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
export { AgoraCountdown } from './gallery/counter';
export { AgoraPolling } from './gallery/vote';
export { AgoraSelector } from './gallery/answer';
export { WidgetsConfigMap, AgoraWidgetPrefix, AgoraWidgetCustomEventType } from './config';
export { WebviewWidget } from './sub-widget/webview/webview';
