import { ThemeProvider, transI18n, WidgetModal } from '~ui-kit';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import App from './app';
import { PluginStore } from './store';
import './i18n/config';
import { AgoraEduToolWidget } from '../../common/edu-tool-widget';
import { AgoraWidgetController, EduRoleTypeEnum } from 'agora-edu-core';
import { AgoraExtensionWidgetEvent } from '@/infra/api';
export class AgoraCountdown extends AgoraEduToolWidget {
  private _store?: PluginStore;
  @observable
  roomProperties: any = {};
  @observable
  userProperties: any = {};
  private _dom?: HTMLElement;

  get widgetName(): string {
    return 'countdownTimer';
  }

  get zContainer(): 0 | 10 {
    return 10;
  }

  get hasPrivilege() {
    const { role } = this.classroomConfig.sessionInfo;
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role);
  }

  get minWidth() {
    return 258;
  }
  get minHeight() {
    return 144;
  }

  onInstall(controller: AgoraWidgetController) {
    controller.broadcast(AgoraExtensionWidgetEvent.RegisterCabinetTool, {
      id: this.widgetName,
      name: transI18n('widget_countdown.appName'),
      iconType: 'countdown',
    });
  }

  onUninstall(controller: AgoraWidgetController) {
    controller.broadcast(AgoraExtensionWidgetEvent.UnregisterCabinetTool, this.widgetName);
  }

  @action
  onCreate(properties: any, userProperties: any) {
    this._store = new PluginStore(this);
    this.roomProperties = properties;
    this.userProperties = userProperties;
    this._checkState(properties);
  }

  @action
  onPropertiesUpdate(properties: any) {
    this.roomProperties = properties;
    this._checkState(properties);
  }
  @action
  onUserPropertiesUpdate(userProperties: any) {
    this.userProperties = userProperties;
  }

  private _checkState(props: any) {
    const isStudent = EduRoleTypeEnum.student === this.classroomConfig.sessionInfo.role;
    if (props.extra?.state === 0 && isStudent) {
      this.setVisibility(false);
    } else {
      this.setVisibility(true);
    }
  }

  render(dom: HTMLElement) {
    this._dom = dom;
    ReactDOM.render(
      <Provider store={this._store}>
        <ThemeProvider value={this.theme}>
          <WidgetModal
            title={transI18n('widget_countdown.appName')}
            closable={this.controlled}
            onCancel={this.handleClose}
            onResize={this.handleResize}>
            <App widget={this} />
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
}
