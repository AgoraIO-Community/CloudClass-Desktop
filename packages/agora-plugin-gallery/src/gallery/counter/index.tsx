import 'promise-polyfill/src/polyfill';
import React from 'react';
import {
  IAgoraExtensionApp,
  AgoraExtensionAppTypeEnum,
  ExtensionStoreEach as ExtensionStore,
  ExtensionController,
} from 'agora-edu-core';

import { transI18n } from '~ui-kit';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import App from './app';
import { PluginStore } from './store';
import { COUNTDOWN } from '../../constants';
import './i18n/config';

export class AgoraCountdown implements IAgoraExtensionApp {
  static store: PluginStore | null = null;
  appIdentifier = COUNTDOWN;
  appName = transI18n('widget_answer.appName');
  icon = 'countdown';
  type = AgoraExtensionAppTypeEnum.POPUP;
  width = 258;
  height = 144; // 开始倒计时后高度为 55
  minWidth = 258;
  minHeight = 144;
  trackPath = true;

  apply(storeobserver: ExtensionStore, controller: ExtensionController) {
    this.appName = transI18n('widget_answer.appName');
    AgoraCountdown.store = new PluginStore(controller, storeobserver);
  }

  render(dom: Element | null) {
    dom &&
      ReactDOM.render(
        <Provider store={AgoraCountdown.store}>
          <App />
        </Provider>,
        dom,
      );
  }

  destory() {
    AgoraCountdown.store?.resetStore();
  }
}
