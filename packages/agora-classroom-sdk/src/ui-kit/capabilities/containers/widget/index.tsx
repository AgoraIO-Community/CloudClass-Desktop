import { AgoraChatWidget, AgoraHXChatWidget } from 'agora-widget-gallery';
import { Radio, RadioChangeEvent } from 'antd';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { IAgoraWidget, EduClassroomConfig } from 'agora-edu-core';
import { Button } from '~ui-kit';
import { useStore } from '~hooks/use-edu-stores';
import './index.css';

interface BaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
}

export interface WidgetProps extends BaseProps {
  widgetComponent: IAgoraWidget;
  widgetProps?: Record<string, unknown>;
}

export const Widget: FC<WidgetProps> = observer(
  ({ className, widgetComponent, widgetProps = {}, ...restProps }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const uiStore = useStore();
    const language = EduClassroomConfig.shared.rteEngineConfig.language;
    widgetProps = { ...widgetProps, language, uiStore };
    useEffect(() => {
      if (ref.current && widgetComponent) {
        // only run for very first time
        widgetComponent.widgetDidLoad(ref.current, widgetProps);
      }
      return () => {
        widgetComponent.widgetWillUnload();
      };
    }, [ref, widgetComponent]);

    const cls = classnames({
      [`${className}`]: !!className,
    });
    return <div ref={ref} className={cls} {...restProps}></div>;
  },
);

export const WidgetOuter: FC = observer(() => {
  const [visible, setVisible] = useState(false);
  const [chatValue, setChatValue] = useState('hxchat');

  const onChange = (e: RadioChangeEvent) => {
    setChatValue(e.target.value);
  };

  return !visible ? (
    <>
      <Radio.Group onChange={onChange} value={chatValue}>
        <Radio value="agora">agora chat</Radio>
        <Radio value="hxchat">hxchat</Radio>
      </Radio.Group>
      <Button onClick={() => setVisible((pre) => !pre)}>join chat</Button>
    </>
  ) : (
    <>
      {chatValue === 'agora' && (
        <Widget widgetComponent={new AgoraChatWidget()} key="chat-widge" className="chat-panel" />
      )}
      {chatValue === 'hxchat' && (
        <Widget widgetComponent={new AgoraHXChatWidget()} key="chat-widge" className="chat-panel" />
      )}
    </>
  );
});
