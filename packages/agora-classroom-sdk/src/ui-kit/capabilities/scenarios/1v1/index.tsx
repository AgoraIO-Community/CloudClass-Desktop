import { useEffectOnce } from '@/infra/hooks/utils';
import {
  useAppPluginContext,
  useCloudDriveContext,
  useGlobalContext,
  useRoomContext,
  useWidgetContext,
} from 'agora-edu-core';
import classnames from 'classnames';
import { get } from 'lodash';
import { observer } from 'mobx-react';
import { useLayoutEffect } from 'react';
import { WhiteboardContainer } from '~capabilities/containers/board';
import { DialogContainer } from '~capabilities/containers/dialog';
import { LoadingContainer } from '~capabilities/containers/loading';
import { NavigationBar } from '~capabilities/containers/nav';
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player';
import { ToastContainer } from '~capabilities/containers/toast';
import { VideoList } from '~capabilities/containers/video-player';
import { Widget } from '~capabilities/containers/widget';
import { Aside, Content, Layout } from '~components/layout';
import { LoadingPptContainer } from '~capabilities/containers/loading/loading-ppt';

export const OneToOneScenario = observer(() => {
  const { isFullScreen } = useGlobalContext();

  const { widgets } = useWidgetContext();
  const chatWidget = widgets['chat'];

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

  useEffectOnce(() => {
    joinRoom();
  });

  const cls = classnames({
    'edu-room': 1,
  });

  const chatroomId = get(roomProperties, 'im.huanxin.chatRoomId');
  const orgName = get(roomProperties, 'im.huanxin.orgName');
  const appName = get(roomProperties, 'im.huanxin.appName');

  const className = 'normal';

  return (
    <Layout className={cls} direction="col">
      <NavigationBar />
      <Layout className="horizontal">
        <Content>
          <WhiteboardContainer>
            <ScreenSharePlayerContainer />
          </WhiteboardContainer>
        </Content>
        <Aside
          className={classnames({
            'one-class-aside': 1,
            'one-class-aside-full': isFullScreen,
          })}>
          <VideoList />
          {chatroomId ? (
            <Widget
              key={chatroomId}
              className="chat-panel"
              widgetComponent={chatWidget}
              widgetProps={{ chatroomId, orgName, appName }}
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
  );
});
