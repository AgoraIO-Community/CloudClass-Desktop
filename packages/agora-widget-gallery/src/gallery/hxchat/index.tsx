import React, { useLayoutEffect, useRef, useEffect } from 'react';
import type { AgoraWidgetHandle, AgoraWidgetContext, IAgoraWidget } from 'agora-edu-core';
import { observer, Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store';
import { usePluginStore } from './hooks';
import { get, set } from 'lodash';
//@ts-ignore
// const hx = require()
import * as hx from 'agora-chat-widget';

type AppProps = {
  orgName: string;
  appName: string;
};

const App: React.FC<AppProps> = observer((props) => {
  const pluginStore = usePluginStore();
  const { localUserInfo, roomInfo } = pluginStore.context;
  const chatroomId = get(pluginStore.props, 'chatroomId');
  const orgName = get(pluginStore.props, 'orgName');
  const appName = get(pluginStore.props, 'appName');

  const { events, actions } = pluginStore.context;

  useEffect(() => {
    events.chat.subscribe((state: any) => {
      pluginStore.chatContext = state;
    });
    events.global.subscribe((state: any) => {
      pluginStore.globalContext = state;
    });
    return () => {
      events.global.unsubscribe();
    };
  }, []);

  const { chatCollapse } = pluginStore.chatContext;

  const { isJoined, isFullScreen } = pluginStore.globalContext;

  const { toggleChatMinimize } = actions.chat;

  useEffect(() => {
    if ((isFullScreen && !chatCollapse) || (!isFullScreen && chatCollapse)) {
      // 第一个条件 点击全屏默认聊天框最小化
      // 第二个条件，全屏幕最小化后，点击恢复（非全屏），恢复聊天框
      toggleChatMinimize();
    }
  }, [isFullScreen]);

  set(
    pluginStore,
    'props.imAvatarUrl',
    'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png',
  );
  // set(pluginStore, 'props.imUserName', userName);

  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (domRef.current && isJoined) {
      //@ts-ignore
      console.log('store-----', pluginStore);
      hx.renderHXChatRoom(domRef.current, pluginStore);
    }
  }, [domRef.current, isJoined, isFullScreen]);

  return (
    <div id="hx-chatroom" ref={domRef} style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* <iframe style={{width:'100%',height:'100%'}} src={`https://cloudclass-agora-test.easemob.com/?chatRoomId=${chatroomId}&roomUuid=${roomInfo.roomUuid}&roleType=${localUserInfo.roleType}&userUuid=${localUserInfo.userUuid}&avatarUrl=${'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png'}&nickName=${localUserInfo.userName}&org=${orgName}&apk=${appName}`}></iframe> */}
    </div>
  );
});

export class AgoraHXChatWidget implements IAgoraWidget {
  widgetId = 'io.agora.widget.hx.chatroom';
  store?: PluginStore;

  constructor() {}

  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, props: any): void {
    this.store = new PluginStore(ctx, props);
    console.log('widgetDidLoad', props);
    // hx.renderHXChatRoom(dom)
    ReactDOM.render(
      <Provider store={this.store}>
        <App {...props} />
      </Provider>,
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
