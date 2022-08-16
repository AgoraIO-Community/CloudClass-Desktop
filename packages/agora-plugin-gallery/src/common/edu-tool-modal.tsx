import { FC, useEffect, useState } from 'react';
import { AgoraEduToolWidget } from './edu-tool-widget';
import { ThemeProvider, WidgetModal } from '~ui-kit';

export const ControlledModal: FC<{
  widget: AgoraEduToolWidget;
  title: string;
  onReload?: () => void;
  onCancel: () => void;
  onFullScreen?: () => void;
  canRefresh?: boolean;
  canFullScreen?: boolean;
}> = ({ widget, title, onReload, onCancel, onFullScreen, canRefresh, canFullScreen, children }) => {
  const [controlled, setControlled] = useState(() => widget.controlled);
  useEffect(() => {
    const handleChange = () => {
      setControlled(widget.controlled);
    };

    widget.addControlStateListener(handleChange);

    return () => {
      widget.removeControlStateListener(handleChange);
    };
  }, []);

  return (
    <ThemeProvider value={widget.theme}>
      <WidgetModal
        title={title}
        showRefresh={canRefresh}
        showFullscreen={canFullScreen}
        closable={controlled}
        onReload={onReload}
        onCancel={onCancel}
        onFullScreen={onFullScreen}>
        {children}
      </WidgetModal>
    </ThemeProvider>
  );
};
