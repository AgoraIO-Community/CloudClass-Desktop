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
  controlled?: boolean;
  onPlaybackRateChange: (suggestedRate: { target: any; data: number }) => void;
  onPlaybackQualityChange: (suggestedQuality: { target: any; data: string }) => void;
  onStateChange: (e: { data: number; target: any }) => void;
}) => {
  const {
    url,
    isYoutube,
    domId,
    controlled,
    onPlaybackRateChange,
    onPlaybackQualityChange,
    onStateChange,
  } = initialState;
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const onPlayerReady = useCallback(() => {
    setPlayerReady(true);
    playerRef.current?.addEventListener('onStateChange', onStateChange);
  }, []);
  const reload = useCallback(() => {
    setPlayerReady(false);
    playerRef.current?.destroy();
    playerRef.current = null;
    initialize();
  }, [controlled]);
  const createYTBPlayer = useCallback(
    (domId: string) => {
      playerRef.current = new window.YT.Player(domId, {
        height: document.querySelector(`#${domId}`)?.clientHeight,
        width: document.querySelector(`#${domId}`)?.clientWidth,
        videoId: getYouTubeVideoIdFromUrl(url),
        playerVars: {
          controls: controlled ? 1 : 0,
          fs: 0,
          modestbranding: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: onPlayerReady,
          onPlaybackRateChange: controlled && onPlaybackRateChange,
          onPlaybackQualityChange: controlled && onPlaybackQualityChange,
        },
      });
    },
    [controlled],
  );
  const initialize = useCallback(async () => {
    if (playerRef.current || controlled === undefined) return;
    if (isYoutube) {
      if (window.YT) {
        createYTBPlayer(domId);
      } else {
        window.onYouTubeIframeAPIReady = () => createYTBPlayer(domId);
        loadYoutubeIframeAPI();
      }
    }
  }, [domId, controlled]);

  useEffect(() => {
    initialize();
  }, [controlled]);
  useEffect(() => () => playerRef.current?.destroy(), []);
  return { playerInstance: playerRef, playerReady, reloadPlayer: reload };
};
export const Webview = observer((props: { widget: WebviewWidget }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeContainerRef = useRef<HTMLIFrameElement>(null);
  const controlledRef = useRef<boolean>();
  const controlledState = useControlledState(props.widget);

  const domId = `YoutubePlayer-${props.widget.id}`;
  const webViewUrl = useMemo(() => {
    return decodeURIComponent(props.widget.widgetRoomProperties.extra?.webViewUrl || '');
  }, [props.widget.widgetRoomProperties.extra?.webViewUrl]);
  const isYoutube = useMemo(() => {
    return webViewUrl.includes('youtube.com') || webViewUrl.includes('youtu.be') || false;
  }, [webViewUrl]);

  const onPlaybackQualityChange = (suggestedQuality: { target: any; data: string }) => {
    props.widget.widgetController.updateWidgetProperties(props.widget.id, {
      extra: { playbackQuality: suggestedQuality.data },
    });
  };
  const onPlaybackRateChange = (suggestedRate: { target: any; data: number }) => {
    props.widget.widgetController.updateWidgetProperties(props.widget.id, {
      extra: { playbackRate: suggestedRate.data },
    });
  };
  const onStateChange = (e: { data: number; target: any }) => {
    if (controlledRef.current) {
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
      postPlayerStateToServer();
    }
  };
  useEffect(() => {
    controlledRef.current = controlledState.isTeacherOrAssistant;
  }, [controlledState]);
  const { playerInstance, playerReady, reloadPlayer } = useYoutubePlayer({
    url: webViewUrl,
    isYoutube,
    domId,
    controlled: controlledState.isTeacherOrAssistant,
    onPlaybackQualityChange,
    onPlaybackRateChange,
    onStateChange: debounce(onStateChange, 1000),
  });

  useEffect(() => {
    if (playerReady) {
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
  }, [
    props.widget.widgetRoomProperties.extra?.currentTime,
    props.widget.widgetRoomProperties.extra?.isPlaying,
    props.widget.widgetRoomProperties.extra?.isMuted,
    props.widget.widgetRoomProperties.extra?.volume,
    props.widget.widgetRoomProperties.extra?.playbackRate,
    props.widget.widgetRoomProperties.extra?.playbackQuality,
  ]);

  useEffect(() => {
    addListeners();
    return removeListeners;
  }, [controlledState.isTeacherOrAssistant]);
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
  const postPlayerStateToServer = useCallback(() => {
    const currentTime = playerInstance.current?.getCurrentTime();
    const isMuted = playerInstance.current?.isMuted();
    const volume = playerInstance.current?.getVolume();

    props.widget.widgetController.updateWidgetProperties(props.widget.id, {
      extra: { currentTime, isMuted, volume },
    });
  }, []);

  const handleWidgetReload = useCallback(
    (widgetId: string) => {
      if (widgetId === props.widget.id) {
        if (isYoutube) {
          reloadPlayer();
          if (controlledRef.current)
            props.widget.widgetController.updateWidgetProperties(props.widget.id, {
              extra: { isPlaying: false },
            });
        } else {
          if (iframeRef.current) {
            iframeRef.current.src = webViewUrl;
          }
        }
      }
    },
    [webViewUrl, isYoutube, controlledState.isTeacherOrAssistant],
  );
  const syncPlayerStateFromRoomProperties = useCallback(() => {
    const { extra } = props.widget.widgetRoomProperties;

    if (Math.abs((extra?.currentTime || 0) - (playerInstance.current?.getCurrentTime() || 0)) > 3) {
      playerInstance.current?.seekTo(extra?.currentTime);
    }
    if (extra?.isPlaying) {
      playerInstance.current?.playVideo();
    } else {
      playerInstance.current?.pauseVideo();
    }
    if (extra?.playbackRate) {
      const currentPlaybackRate = playerInstance.current.getPlaybackRate();
      if (extra.playbackRate !== currentPlaybackRate)
        playerInstance.current.setPlaybackRate(extra.playbackRate);
    }
    if (extra?.playbackQuality) {
      const currentPlaybackQuality = playerInstance.current.getPlaybackQuality();
      if (extra.playbackQuality !== currentPlaybackQuality) {
        playerInstance.current.setPlaybackQuality(extra.playbackQuality);
      }
    }
    if (extra?.volume) {
      const currentVolume = playerInstance.current.getVolume();
      if (currentVolume !== extra.volume) playerInstance.current.setVolume(extra.volume);
    }
    if (extra?.isMuted !== undefined) {
      const isMute = playerInstance.current.isMuted();
      if (isMute !== extra.isMuted)
        extra.isMuted ? playerInstance.current.mute() : playerInstance.current.unMute();
    }
  }, [
    props.widget.widgetRoomProperties.extra?.currentTime,
    props.widget.widgetRoomProperties.extra?.isPlaying,
    props.widget.widgetRoomProperties.extra?.isMuted,
    props.widget.widgetRoomProperties.extra?.volume,
    props.widget.widgetRoomProperties.extra?.playbackRate,
    props.widget.widgetRoomProperties.extra?.playbackQuality,
  ]);
  const handleWidgetRoomPropertiesUpdate = useCallback((widgetId: string) => {
    if (widgetId === props.widget.id) {
      syncPlayerStateFromRoomPropertiesWithoutControlled();
    }
  }, []);
  const syncPlayerStateFromRoomPropertiesWithoutControlled = useCallback(() => {
    if (!controlledRef.current) {
      syncPlayerStateFromRoomProperties();
    }
  }, []);

  const sync = useCallback(() => {
    if (controlledRef.current) {
      postPlayerStateToServer();
    }
  }, []);
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
              pointerEvents: controlledState.isTeacherOrAssistant ? 'auto' : 'none',
            }}></div>
        ) : (
          <iframe
            ref={iframeRef}
            src={webViewUrl}
            style={{ width: '100%', height: '100%' }}></iframe>
        )}
      </div>
    ),
    [webViewUrl, isYoutube, controlledState.isTeacherOrAssistant],
  );
  return memo;
});
