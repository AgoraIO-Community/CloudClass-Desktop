import { Layout, Content, Aside } from '~components/layout';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import {
  useRoomContext,
  useCloudDriveContext,
  useGlobalContext,
  useChatContext,
  useWidgetContext,
  useAppPluginContext,
} from 'agora-edu-core';
import { NavigationBar } from '~capabilities/containers/nav';
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player';
import { WhiteboardContainer } from '~capabilities/containers/board';
import { DialogContainer } from '~capabilities/containers/dialog';
import { LoadingContainer } from '~capabilities/containers/loading';
import {
  MidVideoMarqueeContainer,
  VideoMarqueeStudentContainer,
  VideoPlayerTeacher,
} from '~capabilities/containers/video-player';
import { HandsUpContainer } from '~capabilities/containers/hands-up';
import { useEffectOnce } from '@/infra/hooks/utils';
import React from 'react';
import { Widget } from '~capabilities/containers/widget';
import { useLayoutEffect } from 'react';
import { useUIStore } from '@/infra/hooks';

import { ToastContainer } from '~capabilities/containers/toast';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { get } from 'lodash';
import { LoadingPptContainer } from '~capabilities/containers/loading/loading-ppt';
import { RootBox } from '~ui-kit';

export const MidClassScenario = observer(() => {
  const { initCourseWareProgress, initCourseWareLoading } = useCloudDriveContext();

  const { joinRoom, roomProperties, isJoiningRoom } = useRoomContext();

  const { onLaunchAppPlugin, onShutdownAppPlugin } = useAppPluginContext();

  useLayoutEffect(() => {
    if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 1) {
      // 开启倒计时
      onLaunchAppPlugin('io.agora.countdown');
    } else if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 0) {
      // 关闭倒计时
      onShutdownAppPlugin('io.agora.countdown');
    }
  }, [roomProperties]);

  const { isFullScreen } = useGlobalContext();

  const { widgets } = useWidgetContext();
  const chatWidget = widgets['chat'];

  const { chatCollapse } = useUIStore();

  useEffectOnce(() => {
    joinRoom();
  });

  const cls = classnames({
    'edu-room': 1,
    fullscreen: !!isFullScreen,
  });

  const chatroomId = get(roomProperties, 'im.huanxin.chatRoomId');
  const orgName = get(roomProperties, 'im.huanxin.orgName');
  const appName = get(roomProperties, 'im.huanxin.appName');

  const {
    roomInfo: { userRole },
  } = useRoomContext();

  const visible = userRole !== EduRoleTypeEnum.invisible;

  return (
    <RootBox>
      <Layout className={cls} direction="col">
        <NavigationBar />
        <Layout className="layout-video">
          <MidVideoMarqueeContainer />
        </Layout>
        <Layout className="horizontal">
          <Content className="column">
            <div className="board-box">
              <WhiteboardContainer>
                <ScreenSharePlayerContainer />
              </WhiteboardContainer>
            </div>
            <div
              className={classnames({
                'pin-right': 1,
              })}
              style={{ display: 'flex' }}>
              <HandsUpContainer />
            </div>
          </Content>
          <Aside
            className={classnames({
              'mid-class-aside': 1,
              'mid-class-aside-full-not-collapse': isFullScreen && !chatCollapse,
              'mid-class-aside-full-collapse': isFullScreen && chatCollapse,
            })}>
            {chatroomId ? (
              <Widget
                key={chatroomId}
                className="chat-panel"
                widgetComponent={chatWidget}
                // TODO: the same design as native mobile
                widgetProps={{ chatroomId, orgName, appName, isFullScreen }}
              />
            ) : (
              <Widget
                key={chatroomId}
                className="chat-panel chat-border"
                widgetComponent={chatWidget}
              />
            )}
          </Aside>
        </Layout>
        <LoadingPptContainer />
        <DialogContainer />
        <LoadingContainer loading={isJoiningRoom} />
        {/* <ToastContainer /> */}
      </Layout>
    </RootBox>
  );
});
