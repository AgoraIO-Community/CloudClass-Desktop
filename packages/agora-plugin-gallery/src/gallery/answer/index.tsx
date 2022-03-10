import 'promise-polyfill/src/polyfill';
import { FC, useState } from 'react';
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
import Clock from './clock';
import { PluginStore } from './store';
import './i18n/config';
import { Button, transI18n } from '~ui-kit';
import { SELECTOR } from '../../constants';
import awardSvg from './award.svg';

export class AgoraSelector implements IAgoraExtensionApp {
  static store: PluginStore | null = null;
  appIdentifier = SELECTOR;
  appName = transI18n('widget_selector.appName');
  icon = 'answer';
  width = 390;
  height = 150; // 超过4个选项高度为220
  minWidth = 390;
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

const AwardButton: FC<{ onAward: (type: 'winner' | 'all') => void }> = ({ children, onAward }) => {
  const [listVisible, setListVisible] = useState(false);

  return (
    <div className="award-wrap">
      <div className={'award-list' + (listVisible ? '' : ' hidden')}>
        <ul>
          <li
            onClick={() => {
              setListVisible(false);
              onAward('winner');
            }}>
            奖励答对学生
          </li>
          <li
            onClick={() => {
              setListVisible(false);
              onAward('all');
            }}>
            奖励参与学生
          </li>
        </ul>
      </div>
      <Button
        onClick={() => {
          setListVisible(!listVisible);
        }}>
        <div className="flex">
          <span
            style={{
              display: 'inline-block',
              height: 24,
              width: 24,
              backgroundImage: `url(${awardSvg})`,
            }}
          />
          {children}
        </div>
      </Button>
    </div>
  );
};
