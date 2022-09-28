import { AgoraWidgetBase, AgoraWidgetLifecycle } from 'agora-classroom-sdk';
import { AgoraWidgetController, EduRoleTypeEnum } from 'agora-edu-core';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import ReactDOM from 'react-dom';
import { WaterMark } from '~components';
import { WidgetWatermarkUIStore } from './store';
const App = observer(({ widget }: { widget: FcrWatermarkWidget }) => {
  const widgetStore = widget.widgetStore as WidgetWatermarkUIStore;
  return widgetStore.visible ? (
    <WaterMark className="h-full" markClassName="h-full" content={widgetStore.content}></WaterMark>
  ) : null;
});

export class FcrWatermarkWidget extends AgoraWidgetBase implements AgoraWidgetLifecycle {
  private _dom?: HTMLElement;
  private _widgetStore = new WidgetWatermarkUIStore(this);
  private _rendered = false;
  get hasPrivilege() {
    const { role } = this.classroomConfig.sessionInfo;
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role);
  }

  onInstall(controller: AgoraWidgetController): void {}
  get widgetName(): string {
    return 'watermark';
  }
  get widgetStore() {
    return this._widgetStore;
  }

  onCreate(properties: any, userProperties: any) {
    // 更新文字和visible状态
    const { visible, content } = properties;
    if (content !== undefined) {
      this._widgetStore.setContent(String(content));
    }
    if (properties.visible !== undefined) {
      this._widgetStore.setVisible(Boolean(visible));
    }
    this._renderApp();
  }

  onPropertiesUpdate(properties: any) {
    // 更新文字和visible状态
    this._renderApp();
  }

  onUserPropertiesUpdate(userProperties: any) {
    this._renderApp();
  }

  onDestroy(): void {}

  private _renderApp() {
    if (!this._rendered && this._dom) {
      this._rendered = true;
      ReactDOM.render(<App widget={this} />, this._dom);
    }
  }

  locate() {
    return document.querySelector('.widget-slot-watermark') as HTMLElement;
  }

  render(dom: HTMLElement): void {
    this._dom = dom;
    const cls = classNames({
      'h-full': 1,
    });
    this._dom.className = cls;
    this._renderApp();
  }

  unload(): void {
    if (this._dom) {
      ReactDOM.unmountComponentAtNode(this._dom);
      this._dom = undefined;
    }
  }

  onUninstall(controller: AgoraWidgetController): void {}
}
