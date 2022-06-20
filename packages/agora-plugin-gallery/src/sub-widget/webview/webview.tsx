import { ReactNode } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { AgoraWidgetBase, IAgoraWidgetRoomProperties, AgoraWidgetController } from 'agora-edu-core';
import { Webview } from './app';
import { transI18n } from '~ui-kit';
interface IWebviewWidgetExtraProperties {
  webViewUrl: string;
  zIndex: number;
}
export class WebviewWidget extends AgoraWidgetBase<IWebviewWidgetExtraProperties> {
  title: string = transI18n('fcr_online_courseware');
  constructor(
    id: string,
    widgetRoomProperties: Partial<IAgoraWidgetRoomProperties<IWebviewWidgetExtraProperties>>,
    controller: AgoraWidgetController,
  ) {
    super(id, widgetRoomProperties, controller, { posOnly: false });
  }
  render = (dom: ReactNode) => {
    ReactDOM.render(
      <Webview
        id={this.id}
        controller={this.widgetController}
        url={this.widgetRoomProperties.extra?.webViewUrl ?? ''}
      />,
      dom,
    );
  };
}
