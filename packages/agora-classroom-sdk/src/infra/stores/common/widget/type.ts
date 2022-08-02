export interface AgoraWidgetStateListener {
  onActive(widgetId: string): void;
  onInactive(WidgetId: string): void;
  onPropertiesUpdate(widgetId: string, props: any): void;
  onUserPropertiesUpdate(widgetId: string, props: any): void;
  onTrackUpdate(widgetId: string, track: any): void;
}

export interface AgoraWidgetMessageListener<T = unknown> {
  widgetId: string;
  messageType: string;
  onMessage(message: T): void;
}

export enum AgoraWidgetTrackMode {
  TrackPositionOnly = 'track-position-only',
  TrackPositionAndDimensions = 'track-position-and-dimensions',
}
