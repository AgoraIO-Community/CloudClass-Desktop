import { AgoraChatWidget, AgoraHXChatWidget } from 'agora-widget-gallery';
import { Radio } from 'antd';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Button } from '~ui-kit';
import { useStore } from '~hooks/use-edu-stores';
import './index.css';
import { AgoraRteEngineConfig } from 'agora-rte-sdk';
interface BaseProps {
  style?: CSSProperties;
  className?: any;
  id?: string;
}

export interface WidgetProps extends BaseProps {
  widgetComponent: any;
  widgetProps?: any;
}

export const Widget: FC<WidgetProps> = observer(
  ({ className, widgetComponent, widgetProps = {}, ...restProps }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const uiStore = useStore();
    const language = AgoraRteEngineConfig.shared.language;
    widgetProps = { ...widgetProps, language, uiStore };
    useEffect(() => {
      if (ref.current && widgetComponent) {
        // only run for very first time
        widgetComponent.widgetDidLoad(ref.current, widgetProps);
      }
      return () => {
        widgetComponent.widgetWillUnload();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, widgetComponent]);

    const cls = classnames({
      [`${className}`]: !!className,
    });
    return <div ref={ref} className={cls} {...restProps}></div>;
  },
);

export const WidgetOuter: FC<any> = observer(() => {
  const [visible, setVisible] = useState(false);
  const [chatValue, setChatValue] = useState('hxchat');

  const onChange = (e: any) => {
    setChatValue(e.target.value);
  };

  return !visible ? (
    <>
      <Radio.Group onChange={onChange} value={chatValue}>
        <Radio value="agora">agora chat</Radio>
        <Radio value="hxchat">hxchat</Radio>
      </Radio.Group>
      <Button onClick={(_) => setVisible((pre) => !pre)}>join chat</Button>
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
