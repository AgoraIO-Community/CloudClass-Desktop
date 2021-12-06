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
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

type AppProps = {
  orgName: string;
  appName: string;
  uiStore: EduClassroomUIStore;
};

const App: React.FC<AppProps> = observer((props) => {
  const { uiStore, ...resetProps } = props;
  const [minimize, toggleChatMinimize] = useState<boolean>(false);
  const isFullScreen = false; // todo from uistore
  const isJoined =
    uiStore.classroomStore.connectionStore.classroomState === ClassroomState.Connected;

  const localUserInfo = {
    userUuid: EduClassroomConfig.shared.sessionInfo.userUuid,
    userName: EduClassroomConfig.shared.sessionInfo.userName,
    roleType: EduClassroomConfig.shared.sessionInfo.role,
  };
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
    showChat: [EduRoomTypeEnum.Room1v1Class, EduRoomTypeEnum.RoomBigClass].includes(
      EduClassroomConfig.shared.sessionInfo.roomType,
    ),
    isShowMiniIcon: ![EduRoomTypeEnum.Room1v1Class, EduRoomTypeEnum.RoomBigClass].includes(
      EduClassroomConfig.shared.sessionInfo.roomType,
    ),
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

  set(
    uiStore,
    'props.imAvatarUrl',
    'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png',
  );
  // set(pluginStore, 'props.imUserName', userName);

  const hxStore = {
    context,
    globalContext,
    props: { ...resetProps, chatroomId, appName, orgName },
  };
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (domRef.current && isJoined && chatroomId) {
      //@ts-ignore
      hx.renderHXChatRoom(domRef.current, hxStore);
    }
  }, [domRef.current, isJoined, isFullScreen, chatroomId]);

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
    // hx.renderHXChatRoom(dom)
    ReactDOM.render(<App {...props} />, dom);
  }
  // TODO: uncertain
  widgetRoomPropertiesDidUpdate(properties: any, cause: any): void {}
  widgetWillUnload(): void {
    console.log('widgetWillUnload>>>>');
    //@ts-ignore
    hx.logout();
  }
}
