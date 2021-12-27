import { EduClassroomConfig, UUAparser } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Widget } from '~containers/widget';
import { useLectureH5UIStores } from '~hooks/use-edu-stores';
import { Layout } from '~components/layout';
import './index.css';
import classnames from 'classnames';

export const ChatWidget: FC<any> = observer((props) => {
  return (
    <Widget
      widgetComponent={EduClassroomConfig.shared.widgets['chat']}
      widgetProps={props}
      className="chat-panel"
    />
  );
});

export const ChatWidgetH5: FC<any> = observer(() => {
  const { layoutUIStore, streamUIStore } = useLectureH5UIStores();
  return (
    <Layout
      className={classnames(
        layoutUIStore.chatWidgetH5Cls,
        streamUIStore.containerH5VisibleCls,
        'h5-chat-pannel',
      )}>
      <ChatWidget visibleEmoji={false} visibleBtnSend={false} inputBoxStatus="inline" />
    </Layout>
  );
});

export const ChatWidgetPC: FC<any> = observer(() => {
  return <ChatWidget visibleEmoji={!UUAparser.mobileBrowser} />;
});
