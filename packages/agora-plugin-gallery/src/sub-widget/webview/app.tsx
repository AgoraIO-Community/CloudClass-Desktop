import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { AgoraWidgetController } from 'agora-edu-core';
import { AgoraWidgetCustomEventType } from '../../config';
export const Webview = (props: { id: string; url: string; controller: AgoraWidgetController }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeContainerRef = useRef<HTMLIFrameElement>(null);
  const webViewUrl = useMemo(() => {
    return decodeURIComponent(props.url)
      .replace('youtube.com/watch?v=', 'youtube.com/embed/')
      .replace('youtu.be/', 'youtube.com/embed/');
  }, [props.url]);
  const handleWidgetReload = useCallback(
    (_e) => {
      if (iframeRef.current) {
        iframeRef.current.src = webViewUrl;
      }
    },
    [props.id, iframeRef.current, webViewUrl],
  );
  useEffect(() => {
    props.controller.eventBus.on(AgoraWidgetCustomEventType.WidgetReload, handleWidgetReload);
    document.addEventListener('mousedown', () => {
      if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'auto';
      document.addEventListener('mouseup', () => {
        if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'none';
      });
    });
    return () => {
      props.controller.eventBus.off(AgoraWidgetCustomEventType.WidgetReload, handleWidgetReload);
    };
  }, []);
  const memo = useMemo(
    () => (
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
        <iframe ref={iframeRef} src={webViewUrl} style={{ width: '100%', height: '100%' }}></iframe>
      </div>
    ),
    [webViewUrl],
  );
  return memo;
};
