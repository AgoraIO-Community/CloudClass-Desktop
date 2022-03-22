import 'promise-polyfill/src/polyfill';
import React from 'react';
import { autorun } from 'mobx';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import {
  IAgoraExtensionApp,
  AgoraExtensionAppTypeEnum,
  ExtensionStoreEach as ExtensionStore,
  ExtensionController,
} from 'agora-edu-core';
import App from './app';
import Clock from './Clock';
import { PluginStore } from './store';
import './i18n/config';
import { transI18n } from '~ui-kit';
import { SELECTOR } from '../../constants';
export class AgoraSelector implements IAgoraExtensionApp {
  static store: PluginStore | null = null;
  appIdentifier = SELECTOR;
  appName = transI18n('widget_selector.appName');
  icon = 'answer';
  width = 360;
  height = 150; // 超过4个选项高度为220
  minWidth = 360;
  minHeight = 150; // 超过4个选项高度为220
  store?: PluginStore;
  customHeader = (<></>);
  trackPath = true;
  type = AgoraExtensionAppTypeEnum.POPUP;

  apply(storeobserver: ExtensionStore, controller: ExtensionController) {
    AgoraSelector.store = new PluginStore(controller, storeobserver);
    this.appName = transI18n('widget_selector.appName');

    autorun(() => {
      this.customHeader = (
        <Clock
          timestampGap={AgoraSelector.store?.getTimestampGap}
          startTime={AgoraSelector.store?.receiveQuestionTime}
          stage={AgoraSelector.store!.answerState}
        />
      );
    });
  }

  render(dom: Element | null) {
    dom &&
      ReactDOM.render(
        <Provider store={AgoraSelector.store}>
          <App />
        </Provider>,
        dom,
      );
  }

  destory() {
    AgoraSelector.store?.resetStore();
  }
}
