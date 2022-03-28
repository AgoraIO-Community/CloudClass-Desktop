import classnames from 'classnames';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useRef } from 'react';
import { IAgoraWidget, EduClassroomConfig } from 'agora-edu-core';
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

    useEffect(() => {
      const language = EduClassroomConfig.shared.rteEngineConfig.language;

      widgetProps = { ...widgetProps, language, uiStore };

      if (ref.current && widgetComponent) {
        // only run for very first time
        widgetComponent.widgetDidLoad(ref.current, widgetProps);
      }
      return () => {
        widgetComponent.widgetWillUnload();
      };
    }, [widgetComponent]);

    const cls = classnames({
      [`${className}`]: !!className,
    });
    return <div ref={ref} className={cls} {...restProps}></div>;
  },
);
