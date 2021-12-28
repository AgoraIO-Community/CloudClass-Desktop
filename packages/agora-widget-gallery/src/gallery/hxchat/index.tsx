//@ts-ignore
// const hx = require()
import * as hx from 'agora-chat-widget';
import {
  ClassroomState,
  EduClassroomConfig,
  EduClassroomUIStore,
  EduRoomTypeEnum,
  IAgoraWidget,
} from 'agora-edu-core';
import { set } from 'lodash';
import { autorun, reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Context } from './chatContext';
import { WidgetChatUIStore } from './store';

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
  const isJoined =
    uiStore.classroomStore.connectionStore.classroomState === ClassroomState.Connected;

  const { localUser } = uiStore.classroomStore.userStore;

  const getIMUserID = () => {
    try {
      return localUser?.userProperties.get('widgets').easemobIM.userId;
    } catch (e) {
      return localUser?.userUuid;
    }
  };

  const localUserInfo = localUser
    ? {
        userUuid: getIMUserID(),
        userName: EduClassroomConfig.shared.sessionInfo.userName,
        roleType: EduClassroomConfig.shared.sessionInfo.role,
      }
    : null;

  const roomInfo = {
    roomUuid: EduClassroomConfig.shared.sessionInfo.roomUuid,
    roomName: EduClassroomConfig.shared.sessionInfo.roomName,
    roomType: EduClassroomConfig.shared.sessionInfo.roomType,
  };

  const context = {
    localUserInfo,
    roomInfo,
  };

  const globalContext = {
    isFullScreen,
    showChat: widgetStore.showChat,
    isShowMiniIcon: !widgetStore.showChat,
    configUIVisible: {
      memebers: EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 成员 tab
      announcement: EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, //公告 tab
      allMute: EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class, // 全体禁言按钮
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
  // set(pluginStore, 'props.imUserName', userName);

  const hxStore = {
    context,
    globalContext,
    props: { ...props, chatroomId, appName, orgName },
  };
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unmount = () => {};
    if (domRef.current && isJoined && chatroomId && localUserInfo) {
      //@ts-ignore
      unmount = hx.renderHXChatRoom(domRef.current, hxStore);
    }
    return () => {
      unmount && unmount();
    };
  }, [domRef.current, isJoined, isFullScreen, chatroomId, localUserInfo]);

  return (
    <div id="hx-chatroom" ref={domRef} style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* <iframe style={{width:'100%',height:'100%'}} src={`https://cloudclass-agora-test.easemob.com/?chatRoomId=${chatroomId}&roomUuid=${roomInfo.roomUuid}&roleType=${localUserInfo.roleType}&userUuid=${localUserInfo.userUuid}&avatarUrl=${'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png'}&nickName=${localUserInfo.userName}&org=${orgName}&apk=${appName}`}></iframe> */}
    </div>
  );
});

export class AgoraHXChatWidget implements IAgoraWidget {
  widgetId = 'io.agora.widget.hx.chatroom';

  constructor() {}

  widgetDidLoad(dom: Element, props: any): void {
    const { uiStore, ...resetProps } = props;
    const widgetStore = new WidgetChatUIStore(uiStore);
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
    console.log('widgetWillUnload>>>>');
    //@ts-ignore
    hx.logout();
  }
}
