import 'promise-polyfill/src/polyfill';
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
import { POLLING } from '../../constants';
import './i18n/config';
import { autorun } from 'mobx';
import React from 'react';

export class AgoraPolling implements IAgoraExtensionApp {
  static store: PluginStore | null = null;
  appIdentifier = POLLING;
  appName = transI18n('widget_polling.appName');
  customHeader = React.createElement('span');
  icon = 'vote';
  type = AgoraExtensionAppTypeEnum.POPUP;
  width = 360;
  height = 283;
  minWidth = 360;
  minHeight = 283;
  trackPath = true;

  apply = (storeobserver: ExtensionStore, controller: ExtensionController) => {
    this.appName = transI18n('widget_polling.appName');
    AgoraPolling.store = new PluginStore(controller, storeobserver);
    let self = this;
    autorun(() => {
      if (!AgoraPolling.store?.isController) {
        let customHeader =
          AgoraPolling.store?.type === 'radio'
            ? transI18n('widget_polling.single-sel')
            : transI18n('widget_polling.mul-sel');
        self.customHeader = React.createElement(
          'span',
          { className: 'vote-type-tip' },
          customHeader,
        );
      }
    });
  };

  render(dom: Element | null) {
    dom &&
      ReactDOM.render(
        <Provider store={AgoraPolling.store}>
          <App />
        </Provider>,
        dom,
      );
  }

  destory() {
    AgoraPolling.store?.resetStore();
  }
}
