import React, { useEffect, useRef, forwardRef } from 'react';
import { observer } from 'mobx-react';
import { FcrWebviewWidget } from '.';
import { ControlledModal } from '../../common/edu-tool-modal';

export type WebviewInterface = {
  refresh: () => void;
};

export const Webview = forwardRef<WebviewInterface, { url: string }>(
  ({ url }: { url: string }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeContainerRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      document.addEventListener('mousedown', () => {
        if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'auto';
        document.addEventListener('mouseup', () => {
          if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'none';
        });
      });
    }, []);

    React.useImperativeHandle(ref, () => ({
      refresh() {
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      },
    }));

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          ref={iframeContainerRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}></div>
        <iframe ref={iframeRef} src={url} style={{ width: '100%', height: '100%' }}></iframe>
      </div>
    );
  },
);

export const App = observer(({ widget }: { widget: FcrWebviewWidget }) => {
  const webviewRef = React.useRef<WebviewInterface>(null);

  const handleReload = () => {
    if (webviewRef.current) {
      webviewRef.current.refresh();
    }
  };

  return (
    <ControlledModal
      widget={widget}
      title={widget.webviewTitle ?? ''}
      canRefresh
      onReload={handleReload}
      onCancel={widget.handleClose}
      onFullScreen={widget.handleFullScreen}>
      <Webview ref={webviewRef} url={widget.webviewUrl ?? ''} />
    </ControlledModal>
  );
});
