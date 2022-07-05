import { ReactNode } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { AgoraWidgetBase, IAgoraWidgetRoomProperties, AgoraWidgetController } from 'agora-edu-core';
import { Webview } from './app';
import { transI18n } from '~ui-kit';
export interface IWebviewWidgetExtraProperties {
  webViewUrl: string;
  zIndex: number;
  type: WebviewTypeEnum;
  isPlaying?: boolean;
  currentTime?: number;
}
export enum WebviewTypeEnum {
  WebView = 'WebView',
  WebViewPlayer = 'WebViewPlayer',
}
export class WebviewWidget extends AgoraWidgetBase<IWebviewWidgetExtraProperties> {
  title: string = transI18n('fcr_online_courseware');
  renderDom: HTMLElement | null = null;
  constructor(
    id: string,
    widgetRoomProperties: Partial<IAgoraWidgetRoomProperties<IWebviewWidgetExtraProperties>>,
    controller: AgoraWidgetController,
  ) {
    super(id, widgetRoomProperties, controller, { posOnly: false });
  }
  render = (dom: HTMLElement) => {
    this.renderDom = dom;
    ReactDOM.render(<Webview widget={this} />, dom);
  };
  onDestroy() {
    this.renderDom && ReactDOM.unmountComponentAtNode(this.renderDom);
  }
}
