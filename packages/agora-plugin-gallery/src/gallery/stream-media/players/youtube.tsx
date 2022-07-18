import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { FcrStreamMediaPlayerWidget } from '..';
import { StreamMediaPlayerInterface } from '../type';
import './index.css';
import { PlayerSync } from './sync';
import Plyr from 'plyr';
export const YoutubePlayer = observer(
  forwardRef<StreamMediaPlayerInterface, { widget: FcrStreamMediaPlayerWidget }>(
    ({ widget }: { widget: FcrStreamMediaPlayerWidget }, ref) => {
      const syncRef = useRef<PlayerSync | null>(null);
      const iframeContainerRef = useRef<HTMLIFrameElement>(null);
      const webViewUrl = useMemo(() => decodeURIComponent(widget.webviewUrl || ''), [
        widget.webviewUrl,
      ]);
      const createPlayer = (ref: HTMLElement) => {
        if (!syncRef.current) {
          syncRef.current = new PlayerSync(widget);
          syncRef.current.setupPlayer(
            new Plyr(ref, {
              fullscreen: { enabled: false },
              controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
              clickToPlay: false,
            }),
          );
        }
      };
      return (
        <div
          style={{ position: 'relative', width: '100%', height: '100%' }}
          className={widget.controlled ? '' : 'player-not-controlled'}>
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
          <div
            ref={(ref) => {
              if (ref) {
                createPlayer(ref);
              } else {
                syncRef.current?.destroy();
              }
            }}
            data-plyr-provider="youtube"
            data-plyr-embed-id={webViewUrl}
            style={{
              pointerEvents: widget.hasPrivilege ? 'auto' : 'none',
            }}></div>
        </div>
      );
    },
  ),
);
