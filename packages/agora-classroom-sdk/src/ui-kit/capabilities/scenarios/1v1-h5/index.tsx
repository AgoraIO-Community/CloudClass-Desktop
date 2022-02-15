import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import Room from '../room';
import { use1v1H5UIStores } from '~hooks/use-edu-stores';
import { Layout, LayoutProps } from '~components/layout';
import { ExtAPPUntrackContainer } from '~containers/ext-app';
import { OneOnOneH5NavgationBarContainer } from '~containers/nav/OneOnOne-h5';
import classnames from 'classnames';
import { Helmet } from 'react-helmet';
import { Tabs, TabPane, transI18n } from '~ui-kit';
import { RoomOneOnOneStreamsH5Container } from '~containers/stream/room-1v1-h5-player';
import { ChatWidgetOneOnOneH5 } from '~containers/widget/chat-widget';
import { ScreenShareContainer } from '~containers/screen-share';
import { LayoutOneOnOneWhiteboardContainer } from '~containers/board/RoomOneOnOneWhiteboardContainer';

export const OneToOneScenarioH5 = observer(() => {
  return (
    <Room>
      <Helmet>
        <title>1v1</title>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="telephone=no" name="format-detection" />
      </Helmet>
      <LayoutOrientation className="flex-col h-full ">
        <OneOnOneH5NavgationBarContainer />
        <OneOnOneH5MainContainer />
        <ExtAPPUntrackContainer />
      </LayoutOrientation>
    </Room>
  );
});

const OneOnOneH5MainContainer = () => {
  return (
    <section className="flex flex-row w-full h-full" style={{ backgroundColor: '#fff' }}>
      <LayoutOneOnOneWhiteboardContainer>
        <ScreenShareContainer />
      </LayoutOneOnOneWhiteboardContainer>
      <H5LayoutStreamAsideContainer />
    </section>
  );
};

const LayoutOrientation: React.FC<LayoutProps> = observer(
  ({ className, children, ...restProps }) => {
    const { layoutUIStore, shareUIStore } = use1v1H5UIStores();

    useEffect(() => {
      shareUIStore.addWindowResizeEventListenerAndSetNavBarHeight(0);
      return () => {
        shareUIStore.removeWindowResizeEventListener();
      };
    });
    return (
      <Layout
        className={classnames('oneOnOne-layout-container', className)}
        direction={layoutUIStore.flexOrientationCls}
        style={layoutUIStore.h5LayoutUIDimensions}
        {...restProps}>
        {children}
      </Layout>
    );
  },
);

const H5LayoutStreamAsideContainer = observer(() => {
  const {
    streamUIStore: { videoStreamSize },
  } = use1v1H5UIStores();

  return (
    <Tabs
      defaultActiveKey="video"
      className="full-size-tabs oneOnone-tabs-container"
      style={{ width: videoStreamSize.width }}>
      <TabPane tab={transI18n('video')} key="video">
        <RoomOneOnOneStreamsH5Container />
      </TabPane>
      <TabPane tab={transI18n('trans_chat')} key="chat" forceRender={true}>
        <ChatWidgetOneOnOneH5 />
      </TabPane>
    </Tabs>
  );
});
