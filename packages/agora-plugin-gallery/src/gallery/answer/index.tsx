import { observable, action } from 'mobx';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import App from './app';
import Clock from './Clock';
import { PluginStore } from './store';
import './i18n/config';
import { AgoraEduToolWidget } from '../../common/edu-tool-widget';
import { ThemeProvider, transI18n, WidgetModal } from '~ui-kit';
import { AgoraWidgetController, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { AgoraExtensionWidgetEvent } from '@/infra/api';

export class AgoraSelector extends AgoraEduToolWidget {
  private _dom?: HTMLElement;
  private _store?: PluginStore;
  @observable
  roomProperties: any = {};
  @observable
  userProperties: any = {};

  get widgetName(): string {
    return 'popupQuiz';
  }

  get zContainer(): 0 | 10 {
    return 10;
  }

  get hasPrivilege() {
    const { role } = this.classroomConfig.sessionInfo;
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role);
  }
  get minWidth() {
    return 360;
  }
  get minHeight() {
    return 150;
  }

  onInstall(controller: AgoraWidgetController) {
    if (controller.classroomConfig.sessionInfo.roomType !== EduRoomTypeEnum.RoomBigClass) {
      controller.broadcast(AgoraExtensionWidgetEvent.RegisterCabinetTool, {
        id: this.widgetName,
        name: transI18n('widget_selector.appName'),
        iconType: 'answer',
      });
    }
  }

  @action
  onCreate(properties: any, userProperties: any) {
    this._store = new PluginStore(this);
    this.roomProperties = properties;
    this.userProperties = userProperties;
  }

  @action
  onPropertiesUpdate(properties: any): void {
    this.roomProperties = properties;
  }

  @action
  onUserPropertiesUpdate(userProperties: any): void {
    this.userProperties = userProperties;
  }

  render(dom: HTMLElement) {
    this._dom = dom;
    ReactDOM.render(
      <Provider store={this._store}>
        <ThemeProvider value={this.theme}>
          <WidgetModal
            title={transI18n('widget_selector.appName')}
            closable={this.controlled}
            onCancel={this.handleClose}
            onResize={this.handleResize}
            header={<Clock />}>
            <App />
          </WidgetModal>
        </ThemeProvider>
      </Provider>,
      dom,
    );
  }

  unload() {
    if (this._dom) {
      ReactDOM.unmountComponentAtNode(this._dom);
      this._dom = undefined;
    }
  }

  onDestroy() {
    if (this._store) {
      this._store.resetStore();
    }
  }

  onUninstall(controller: AgoraWidgetController) {
    controller.broadcast(AgoraExtensionWidgetEvent.UnregisterCabinetTool, this.widgetName);
  }
}
