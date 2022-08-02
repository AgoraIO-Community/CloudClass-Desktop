import * as hx from 'agora-chat-widget';
import { AgoraWidgetBase, AgoraWidgetLifecycle } from 'agora-classroom-sdk';
import { chatEmojiEnabled, chatMuteAllEnabled, chatPictureEnabled } from '@/ui-kit/capabilities/containers/visibility/controlled';
import {
  AgoraWidgetController,
  EduRoleTypeEnum,
  EduRoomSubtypeEnum,
  EduRoomTypeEnum,
  Platform,
} from 'agora-edu-core';
import classNames from 'classnames';
import { autorun, IReactionDisposer, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { WidgetChatUIStore } from './store';

const App = observer(({ widget }: { widget: AgoraHXChatWidget }) => {
  const widgetStore = widget.widgetStore as WidgetChatUIStore;
  const [minimize, toggleChatMinimize] = useState<boolean>(false);
  const isFullScreen = false; // todo from uistore

  const { appId, host, sessionInfo, platform } = widget.classroomConfig;

  const { visibleEmoji, visibleBtnSend, inputBoxStatus, visibleMuteAll, visibleScreenCapture, imgIcon } = widget.imUIConfig;

  const { currentSubRoom } = widget.classroomStore.groupStore;

  const localUserInfo = {
    userUuid: widget.easemobUserId,
    userName: sessionInfo.userName,
    roleType: sessionInfo.role,
    token: sessionInfo.token,
  };

  const roomInfo = {
    roomUuid: sessionInfo.roomUuid,
    roomName: sessionInfo.roomName,
    roomType: sessionInfo.roomType,
  };

  const globalContext = {
    isFullScreen,
    showChat: widgetStore.showChat,
    isShowMiniIcon: !widgetStore.showChat,
    configUIVisible: {
      showInputBox:
        sessionInfo.role !== EduRoleTypeEnum.invisible &&
        sessionInfo.role !== EduRoleTypeEnum.observer, // 输入UI
      memebers: sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 成员 tab
      announcement: !currentSubRoom && sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, //公告 tab
      allMute: visibleMuteAll && sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 全体禁言按钮
      showQuestionBox:
        sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational &&
        sessionInfo.role === EduRoleTypeEnum.student, //职教课的学生显示提问
      isFullSize: widgetStore.isFullSize,
      emoji: visibleEmoji,
      btnSend: visibleBtnSend,
      inputBox: inputBoxStatus,
      platform,
      screenshotIcon: visibleScreenCapture,
      imgIcon
    },
  };

  useEffect(() => {
    if ((isFullScreen && !minimize) || (!isFullScreen && minimize)) {
      // 第一个条件 点击全屏默认聊天框最小化
      // 第二个条件，全屏幕最小化后，点击恢复（非全屏），恢复聊天框
      toggleChatMinimize((pre: boolean) => !pre);
    }
  }, [isFullScreen]);

  useEffect(() => {
    widgetStore.addOrientationchange();
    widgetStore.handleOrientationchange();

    const disposers: IReactionDisposer[] = [];

    disposers.push(
      autorun(() => {
        hx.dispatchVisibleUI({ isFullSize: widgetStore.isFullSize });
      }),
    );

    disposers.push(
      reaction(
        () => widgetStore.showChat,
        (value) => {
          hx.dispatchShowChat(value);
          hx.dispatchShowMiniIcon(!value);
        },
      ),
    );
    return () => {
      widgetStore.removeOrientationchange();
      disposers.forEach((d) => d());
    };
  }, []);

  useEffect(() => {
    widget.setHide(widgetStore.showChat);
  }, [widgetStore.showChat]);

  const hxStore = {
    globalContext,
    context: { ...widget.imUIConfig, ...widget.imConfig, ...roomInfo, ...localUserInfo },
  };

  return (
    <div id="hx-chatroom" style={{ display: 'flex', width: '100%', height: '100%' }}>
      <hx.HXChatRoom
        theme={widget.theme}
        pluginStore={hxStore}
        agoraTokenData={{
          appId,
          host,
          roomUuid: sessionInfo.roomUuid,
          userUuid: sessionInfo.userUuid,
          token: sessionInfo.token,
        }}
      />
    </div>
  );
});

export class AgoraHXChatWidget extends AgoraWidgetBase implements AgoraWidgetLifecycle {
  private _imConfig?: { chatRoomId: string; appName: string; orgName: string };
  private _easemobUserId?: string;
  private _dom?: HTMLElement;
  private _widgetStore = new WidgetChatUIStore(this);
  private _rendered = false;

  onInstall(controller: AgoraWidgetController): void { }
  get widgetName(): string {
    return 'easemobIM';
  }
  get hasPrivilege() {
    return false;
  }

  get imUIConfig() {
    let visibleBtnSend = true;
    let visibleEmoji = true;
    let inputBoxStatus = undefined;
    let visibleMuteAll = true;
    let visibleScreenCapture = true;
    let imgIcon = true;

    if (!chatEmojiEnabled(this.uiConfig)) {
      visibleEmoji = false;
    }
    if (!chatMuteAllEnabled(this.uiConfig)) {
      visibleMuteAll = false;
    }
    if (!chatPictureEnabled(this.uiConfig)) {
      visibleScreenCapture = false;
      imgIcon = false;
    }

    if (this.classroomConfig.platform === Platform.H5) {
      visibleBtnSend = false;
      visibleEmoji = false;
      inputBoxStatus = 'inline';
    }
    const isVocational =
      this.classroomConfig.sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational;
    if (isVocational) {
      visibleEmoji = true;
    }

    return { visibleEmoji, visibleBtnSend, inputBoxStatus, visibleMuteAll, visibleScreenCapture, imgIcon };
  }

  get imConfig() {
    return this._imConfig;
  }

  get easemobUserId() {
    return this._easemobUserId;
  }

  get widgetStore() {
    return this._widgetStore;
  }

  onCreate(properties: any, userProperties: any) {
    this._easemobUserId = userProperties?.userId;
    this._imConfig = properties?.extra;
    this._renderApp();
  }

  onPropertiesUpdate(properties: any) {
    this._imConfig = properties.extra;
    this._renderApp();
  }

  onUserPropertiesUpdate(userProperties: any) {
    this._easemobUserId = userProperties.userId;
    this._renderApp();
  }

  onDestroy(): void { }

  private _renderApp() {
    if (!this._rendered && this.imConfig && this.easemobUserId && this._dom) {
      this._rendered = true;
      ReactDOM.render(<App widget={this} />, this._dom);
    }
  }

  locate() {
    return document.querySelector('.widget-slot-chat') as HTMLElement;
  }

  render(dom: HTMLElement): void {
    this._dom = dom;

    const isVocational =
      this.classroomConfig.sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational;

    const cls = classNames({
      'chat-panel': 1,
      'vocational-chat-panel': isVocational,
    });

    this._dom.className = cls;
    this._renderApp();
  }

  setHide(hide: boolean) {
    const dom = this._dom;
    if (dom) {
      if (hide) {
        dom.classList.add('min-w-0');
      } else {
        dom.classList.remove('min-w-0');
      }
    }
  }

  unload(): void {
    if (this._dom) {
      ReactDOM.unmountComponentAtNode(this._dom);
      this._dom = undefined;
    }
  }

  onUninstall(controller: AgoraWidgetController): void { }
}
