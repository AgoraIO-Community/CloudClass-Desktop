import ReactDOM from 'react-dom';
import { App } from './app';
import {
  AgoraExtensionRoomEvent,
  AgoraExtensionWidgetEvent,
  AgoraWidgetTrackMode,
} from 'agora-classroom-sdk';
import { AgoraEduToolWidget } from '../../common/edu-tool-widget';
import { AgoraWidgetController, EduRoleTypeEnum } from 'agora-edu-core';
import { bound } from 'agora-rte-sdk';

const defaultPos = { xaxis: 0.5, yaxis: 0.5 };
const defaultSize = {
  width: 0.54,
  height: 0.71,
};

export class FcrWebviewWidget extends AgoraEduToolWidget {
  private static _installationDisposer?: CallableFunction;
  private _dom?: HTMLElement;
  private _webviewUrl?: string;
  private _webviewTitle?: string;
  private _privilege = false;

  get widgetName() {
    return 'webView';
  }
  get hasPrivilege() {
    const { role } = this.classroomConfig.sessionInfo;
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role) || this._privilege;
  }

  get resizable(): boolean {
    return true;
  }
  get minWidth() {
    return 400;
  }
  get minHeight() {
    return 300;
  }
  get trackMode() {
    return AgoraWidgetTrackMode.TrackPositionAndDimensions;
  }

  get webviewUrl() {
    return this._webviewUrl;
  }

  get webviewTitle() {
    return this._webviewTitle;
  }

  onInstall(controller: AgoraWidgetController) {
    const handleOpen = ({
      url,
      resourceUuid,
      title,
    }: {
      url: string;
      resourceUuid: string;
      title: string;
    }) => {
      const widgetId = `webView-${resourceUuid}`;
      const extra = {
        webviewTitle: title,
        webViewUrl: url,
        zIndex: 0,
      };
      // 打开远端
      controller.setWidegtActive(widgetId, {
        extra,
        position: defaultPos,
        size: defaultSize,
      });
      // 打开本地
      controller.broadcast(AgoraExtensionWidgetEvent.WidgetBecomeActive, {
        widgetId,
        defaults: {
          properties: { extra },
          trackProperties: { position: defaultPos, size: defaultSize },
        },
      });
    };

    controller.addBroadcastListener({
      messageType: AgoraExtensionRoomEvent.OpenWebview,
      onMessage: handleOpen,
    });

    FcrWebviewWidget._installationDisposer = () => {
      controller.removeBroadcastListener({
        messageType: AgoraExtensionRoomEvent.OpenWebview,
        onMessage: handleOpen,
      });
    };
  }

  onCreate(properties: any) {
    const url = properties.extra?.webViewUrl;
    const title = properties.extra?.webviewTitle;

    if (url) {
      this._webviewUrl = url;
    }
    if (title) {
      this._webviewTitle = title;
    }

    this.addBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.BoardGrantedUsersUpdated,
      onMessage: this._handleGranted,
    });

    this.addMessageListener({
      messageType: AgoraExtensionRoomEvent.ResponseGrantedList,
      onMessage: this._handleGranted,
    });

    this.broadcast(AgoraExtensionWidgetEvent.RequestGrantedList, this.widgetId);
  }

  @bound
  private _handleGranted(grantedUsers: Set<string>) {
    const { userUuid } = this.classroomConfig.sessionInfo;

    this._privilege = grantedUsers.has(userUuid);

    this.fireControlStateChanged();
  }

  @bound
  handleFullScreen() {
    if (this.track.isCovered) {
      this.trackController?.updateRemoteTrack(
        true,
        { x: defaultPos.xaxis, y: defaultPos.yaxis },
        {
          width: defaultSize.width,
          height: defaultSize.height,
        },
      );
    } else {
      this.trackController?.updateRemoteTrack(
        true,
        { x: 0, y: 0 },
        {
          width: 1,
          height: 1,
        },
      );
    }
  }
  render(dom: HTMLElement) {
    this._dom = dom;
    dom.classList.add('h-full');
    ReactDOM.render(<App widget={this} />, dom);
  }

  unload() {
    if (this._dom) {
      ReactDOM.unmountComponentAtNode(this._dom);
      this._dom = undefined;
    }
  }

  onDestroy() {
    this.removeBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.BoardGrantedUsersUpdated,
      onMessage: this._handleGranted,
    });

    this.removeMessageListener({
      messageType: AgoraExtensionRoomEvent.ResponseGrantedList,
      onMessage: this._handleGranted,
    });
  }

  onUninstall(controller: AgoraWidgetController) {
    if (FcrWebviewWidget._installationDisposer) {
      FcrWebviewWidget._installationDisposer();
    }
  }
}
