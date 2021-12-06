import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraHXChatWidget } from 'agora-widget-gallery';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Widget } from '~containers/widget';
import './index.css';

export const Chat = new AgoraHXChatWidget();

export const ChatWidget: FC<any> = observer(() => {
  return (
    <Widget
      widgetComponent={EduClassroomConfig.shared.widgets['chat']}
      key="chat-widge"
      className="chat-panel"
    />
  );
});
