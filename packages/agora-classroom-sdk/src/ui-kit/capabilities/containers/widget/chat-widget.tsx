import { EduClassroomConfig, UUAparser, EduRoomSubtypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Widget } from '~containers/widget';
import { useLectureH5UIStores } from '~hooks/use-edu-stores';
import { Layout } from '~components/layout';
import './index.css';
import classnames from 'classnames';

export const ChatWidget: FC<{
  visibleEmoji: boolean;
  visibleBtnSend?: boolean;
  inputBoxStatus?: string;
}> = (props) => {
  const isVocational =
    EduClassroomConfig.shared.sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational;
  return (
    <Widget
      widgetComponent={EduClassroomConfig.shared.widgets['chat']}
      widgetProps={props}
      className={classnames({
        'chat-panel': 1,
        'vocational-chat-panel': isVocational,
      })}
    />
  );
};

export interface ChatWidgetH5Props {
  visibleEmoji?: boolean;
}

export const ChatWidgetH5: FC<ChatWidgetH5Props> = observer(({ visibleEmoji = false }) => {
  const { layoutUIStore, streamUIStore } = useLectureH5UIStores();
  return (
    <Layout
      className={classnames(
        layoutUIStore.chatWidgetH5Cls,
        streamUIStore.containerH5VisibleCls,
        'h5-chat-pannel',
      )}>
      <ChatWidget visibleEmoji={visibleEmoji} visibleBtnSend={false} inputBoxStatus="inline" />
    </Layout>
  );
});

export const ChatWidgetPC: FC = observer(() => {
  return <ChatWidget visibleEmoji={!UUAparser.mobileBrowser} />;
});
