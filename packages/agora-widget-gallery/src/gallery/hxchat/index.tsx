import * as hx from 'agora-chat-widget';
import {
  ClassroomState,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  IAgoraWidget,
  EduClassroomConfig,
} from 'agora-edu-core';
import { set } from 'lodash';
import { autorun, reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Context } from './chatContext';
import { WidgetChatUIStore } from './store';

type EduClassroomUIStore = any;

type AppProps = {
  orgName: string;
  appName: string;
  visibleEmoji?: boolean;
  visibleBtnSend?: boolean;
  inputBoxStatus?: string | undefined;
  uiStore: EduClassroomUIStore;
};

const App: React.FC<AppProps> = observer((props) => {
  const chatContext = React.useContext(Context);
  const uiStore = chatContext.uiStore as EduClassroomUIStore;
  const widgetStore = chatContext.widgetStore as WidgetChatUIStore;
  const [minimize, toggleChatMinimize] = useState<boolean>(false);
  const isFullScreen = false; // todo from uistore

  const { localUser } = uiStore.classroomStore.userStore;

  const getIMUserID = () => {
    try {
      return localUser?.userProperties.get('widgets').easemobIM.userId;
    } catch (e) {
      return null;
    }
  };

  const userUuid = getIMUserID();

  const localUserInfo = userUuid
    ? {
        userUuid,
        userName: widgetStore.classroomConfig.sessionInfo.userName,
        roleType: widgetStore.classroomConfig.sessionInfo.role,
      }
    : null;

  const roomInfo = {
    roomUuid: widgetStore.classroomConfig.sessionInfo.roomUuid,
    roomName: widgetStore.classroomConfig.sessionInfo.roomName,
    roomType: widgetStore.classroomConfig.sessionInfo.roomType,
  };

  const globalContext = {
    isFullScreen,
    showChat: widgetStore.showChat,
    isShowMiniIcon: !widgetStore.showChat,
    configUIVisible: {
      showInputBox:
        widgetStore.classroomConfig.sessionInfo.role !== EduRoleTypeEnum.invisible &&
        widgetStore.classroomConfig.sessionInfo.role !== EduRoleTypeEnum.observer, // 输入UI
      memebers: widgetStore.classroomConfig.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 成员 tab
      announcement:
        !uiStore.classroomStore.groupStore.currentSubRoom &&
        widgetStore.classroomConfig.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, //公告 tab
      allMute: widgetStore.classroomConfig.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 全体禁言按钮
      isFullSize: widgetStore.isFullSize,
      emoji: typeof props.visibleEmoji !== 'undefined' ? props.visibleEmoji : true,
      btnSend: typeof props.visibleBtnSend !== 'undefined' ? props.visibleBtnSend : true,
      inputBox: props.inputBoxStatus,
    },
  };

  const chatroomId = uiStore.classroomStore.roomStore.imConfig?.chatRoomId;
  const appName = uiStore.classroomStore.roomStore.imConfig?.appName;
  const orgName = uiStore.classroomStore.roomStore.imConfig?.orgName;

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
    return () => widgetStore.removeOrientationchange();
  }, []);

  autorun(() => {
    hx.dispatchVisibleUI({ isFullSize: widgetStore.isFullSize });
  });

  reaction(
    () => widgetStore.showChat,
    (value) => {
      hx.dispatchShowChat(value);
      hx.dispatchShowMiniIcon(!value);
    },
  );

  set(
    uiStore,
    'props.imAvatarUrl',
    'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png',
  );

  const hxStore = {
    globalContext,
    context: { ...props, chatroomId, appName, orgName, ...roomInfo, ...localUserInfo },
  };

  const domRef = useRef<HTMLDivElement>(null);

  return (
    <div id="hx-chatroom" ref={domRef} style={{ display: 'flex', width: '100%', height: '100%' }}>
      <hx.HXChatRoom pluginStore={hxStore} />
    </div>
  );
});

export class AgoraHXChatWidget implements IAgoraWidget {
  widgetId = 'io.agora.widget.hx.chatroom';

  private _dom?: Element;

  constructor(private _classroomConfig: EduClassroomConfig) {}

  widgetDidLoad(dom: Element, props: any): void {
    const { uiStore, ...resetProps } = props;
    const widgetStore = new WidgetChatUIStore(uiStore, this._classroomConfig);
    this._dom = dom;
    ReactDOM.render(
      <Context.Provider value={{ uiStore: uiStore, widgetStore }}>
        <App {...resetProps} />
      </Context.Provider>,
      dom,
    );
  }
  // TODO: uncertain
  widgetRoomPropertiesDidUpdate(properties: any, cause: any): void {}
  widgetWillUnload(): void {
    ReactDOM.unmountComponentAtNode(this._dom!);
  }
}
