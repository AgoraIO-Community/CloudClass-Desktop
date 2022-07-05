import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgoraWidgetBase, AgoraWidgetEventType } from 'agora-edu-core';
import { AgoraWidgetCustomEventType } from '../../config';
import { WebviewWidget } from './webview';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';

const useControlledState = (widget: AgoraWidgetBase) => {
  const [controlledState, setControlledState] =
    useState<{ isTeacherOrAssistant: boolean; isGrantedBoard: boolean }>();

  useEffect(() => {
    widget.widgetController.eventBus.on(
      AgoraWidgetCustomEventType.ControlledStateChange,
      setControlledState,
    );
    widget.widgetController.eventBus.emit(AgoraWidgetCustomEventType.GetControlledState);
    return () => {
      widget.widgetController.eventBus.off(
        AgoraWidgetCustomEventType.ControlledStateChange,
        setControlledState,
      );
    };
  }, []);
  return { ...controlledState };
};

const loadYoutubeIframeAPI = () => {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
};

const getYouTubeVideoIdFromUrl = (url: string) => {
  // Our regex pattern to look for a youTube ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  //Match the url with the regex
  const match = url.match(regExp);
  //Return the result
  return match && match[2].length === 11 ? match[2] : undefined;
};
const useYoutubePlayer = (initialState: {
  url: string;
  isYoutube: boolean;
  domId: string;
  controls?: boolean;
}) => {
  const { url, isYoutube, domId, controls } = initialState;
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const onPlayerReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  const createYTBPlayer = (domId: string) => {
    playerRef.current = new window.YT.Player(domId, {
      height: document.querySelector(`#${domId}`)?.clientHeight,
      width: document.querySelector(`#${domId}`)?.clientWidth,
      videoId: getYouTubeVideoIdFromUrl(url),
      playerVar: { controls: controls ? 1 : 0 },
      events: {
        onReady: onPlayerReady,
      },
    });
  };
  const initialize = useCallback(async () => {
    if (playerRef.current || controls === undefined) return;
    if (isYoutube) {
      if (window.YT) {
        createYTBPlayer(domId);
      } else {
        window.onYouTubeIframeAPIReady = () => createYTBPlayer(domId);
        loadYoutubeIframeAPI();
      }
    }
  }, [domId, controls]);

  useEffect(() => {
    initialize();
  }, [controls]);
  useEffect(() => () => playerRef.current?.destroy(), []);
  return { playerInstance: playerRef, playerReady };
};
export const Webview = observer((props: { widget: WebviewWidget }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeContainerRef = useRef<HTMLIFrameElement>(null);
  const controlledState = useControlledState(props.widget);
  const canControlled = useMemo(() => controlledState.isTeacherOrAssistant, [controlledState]);
  const domId = `YoutubePlayer-${props.widget.id}`;
  const webViewUrl = useMemo(() => {
    return decodeURIComponent(props.widget.widgetRoomProperties.extra?.webViewUrl || '');
  }, [props.widget.widgetRoomProperties.extra?.webViewUrl]);
  const isYoutube = useMemo(() => {
    return webViewUrl.includes('youtube.com') || webViewUrl.includes('youtu.be') || false;
  }, [webViewUrl]);
  const { playerInstance, playerReady } = useYoutubePlayer({
    url: webViewUrl,
    isYoutube,
    domId,
    controls: canControlled,
  });
  useEffect(() => {
    if (playerReady) {
      playerInstance.current?.addEventListener('onStateChange', debounce(onStateChange, 1000));
      syncPlayerStateFromRoomProperties();
    }
    const dispose = startInterval();
    return dispose;
  }, [playerReady]);

  useEffect(() => {
    props.widget.widgetController.eventBus.on(
      AgoraWidgetEventType.WidgetRoomPropertiesUpdate,
      handleWidgetRoomPropertiesUpdate,
    );
    return () => {
      props.widget.widgetController.eventBus.off(
        AgoraWidgetEventType.WidgetRoomPropertiesUpdate,
        handleWidgetRoomPropertiesUpdate,
      );
    };
  }, [canControlled, playerInstance.current, props.widget.widgetRoomProperties]);

  useEffect(() => {
    addListeners();
    return removeListeners;
  }, []);
  const addListeners = () => {
    props.widget.widgetController.eventBus.on(
      AgoraWidgetCustomEventType.WidgetReload,
      handleWidgetReload,
    );

    document.addEventListener('mousedown', handleMousedown);
    document.addEventListener('mouseup', handleMouseup);
  };
  const removeListeners = () => {
    props.widget.widgetController.eventBus.off(
      AgoraWidgetCustomEventType.WidgetReload,
      handleWidgetReload,
    );

    document.removeEventListener('mousedown', handleMousedown);
    document.removeEventListener('mouseup', handleMouseup);
  };
  const handleMousedown = useCallback(() => {
    if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'auto';
  }, []);
  const handleMouseup = useCallback(() => {
    if (iframeContainerRef.current) iframeContainerRef.current.style.pointerEvents = 'none';
  }, []);
  const postCurrentTimeToServer = useCallback(() => {
    const currentTime = playerInstance.current?.getCurrentTime();
    props.widget.widgetController.updateWidgetProperties(props.widget.id, {
      extra: { currentTime },
    });
  }, []);
  const onStateChange = (e: { data: number; target: any }) => {
    if (canControlled) {
      if (e.data === 1 || e.data === 3) {
        props.widget.widgetController.updateWidgetProperties(props.widget.id, {
          extra: { isPlaying: true },
        });
      }
      if (e.data === 2) {
        props.widget.widgetController.updateWidgetProperties(props.widget.id, {
          extra: { isPlaying: false },
        });
      }
      postCurrentTimeToServer();
    }
  };
  const handleWidgetReload = useCallback(
    (widgetId: string) => {
      if (widgetId === props.widget.id) {
        if (isYoutube) {
          playerInstance.current.getIframe().src = playerInstance.current.getIframe().src;
        } else {
          if (iframeRef.current) {
            iframeRef.current.src = webViewUrl;
          }
        }
      }
    },
    [webViewUrl, isYoutube],
  );
  const syncPlayerStateFromRoomProperties = useCallback(() => {
    if (
      Math.abs(
        (props.widget.widgetRoomProperties.extra?.currentTime || 0) -
          (playerInstance.current?.getCurrentTime() || 0),
      ) > 3
    ) {
      playerInstance.current?.seekTo(props.widget.widgetRoomProperties.extra?.currentTime);
    }
    if (props.widget.widgetRoomProperties.extra?.isPlaying) {
      playerInstance.current?.playVideo();
    } else {
      playerInstance.current?.pauseVideo();
    }
  }, [
    props.widget.widgetRoomProperties.extra?.currentTime,
    props.widget.widgetRoomProperties.extra?.isPlaying,
  ]);
  const handleWidgetRoomPropertiesUpdate = useCallback(
    (widgetId: string) => {
      if (widgetId === props.widget.id) {
        syncPlayerStateFromRoomPropertiesWithoutControlled();
      }
    },
    [canControlled],
  );
  const syncPlayerStateFromRoomPropertiesWithoutControlled = useCallback(() => {
    if (!canControlled) {
      syncPlayerStateFromRoomProperties();
    }
  }, [canControlled]);

  const sync = useCallback(() => {
    if (canControlled) {
      postCurrentTimeToServer();
    }
  }, [canControlled]);
  const startInterval = () => {
    const timer = setInterval(sync, 5000);
    return () => {
      clearInterval(timer);
    };
  };

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
        {isYoutube ? (
          <div
            id={domId}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: canControlled ? 'auto' : 'none',
            }}></div>
        ) : (
          <iframe
            ref={iframeRef}
            src={webViewUrl}
            style={{ width: '100%', height: '100%' }}></iframe>
        )}
      </div>
    ),
    [webViewUrl, isYoutube, canControlled],
  );
  return memo;
});
