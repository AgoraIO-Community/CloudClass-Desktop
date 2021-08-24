import { useUIStore } from '@/infra/hooks';
import { useEffectOnce } from '@/infra/hooks/utils';
import {
  useAppPluginContext,
  useCloudDriveContext,
  useGlobalContext,
  useRoomContext,
  useWidgetContext,
} from 'agora-edu-core';
import { EduRoleTypeEnum } from 'agora-edu-core';
import classnames from 'classnames';
import { get } from 'lodash';
import { observer } from 'mobx-react';
import React, { useLayoutEffect } from 'react';
import { WhiteboardContainer } from '~capabilities/containers/board';
import { DialogContainer } from '~capabilities/containers/dialog';
import { HandsUpContainer } from '~capabilities/containers/hands-up';
import { LoadingContainer } from '~capabilities/containers/loading';
import { NavigationBar } from '~capabilities/containers/nav';
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player';
import { ToastContainer } from '~capabilities/containers/toast';
import {
  VideoMarqueeStudentContainer,
  VideoPlayerTeacher,
} from '~capabilities/containers/video-player';
import { Widget } from '~capabilities/containers/widget';
import { Aside, Content, Layout } from '~components/layout';
import { LoadingPptContainer } from '~capabilities/containers/loading/loading-ppt';
import { RootBox } from '~ui-kit';

export const BigClassScenario = observer(() => {
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
        <Layout className="horizontal">
          <Content className="column">
            <VideoMarqueeStudentContainer />
            <div className="board-box">
              <WhiteboardContainer>
                <ScreenSharePlayerContainer />
              </WhiteboardContainer>
            </div>
            <div
              className={classnames({
                'pin-right': 1,
              })}>
              <HandsUpContainer />
            </div>
          </Content>
          <Aside
            className={classnames({
              'big-class-aside': 1,
              'big-class-aside-full-not-collapse': isFullScreen && !chatCollapse,
              'big-class-aside-full-collapse': isFullScreen && chatCollapse,
            })}>
            <div className={isFullScreen ? 'full-video-wrap' : 'video-wrap'}>
              <VideoPlayerTeacher
                className="big-class-teacher"
                controlPlacement="bottom"
                placement="bottom"
              />
            </div>
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
