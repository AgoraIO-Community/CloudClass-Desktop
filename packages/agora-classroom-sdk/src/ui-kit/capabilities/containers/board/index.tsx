import { observer } from 'mobx-react';
import { FC, useMemo, useEffect, useRef } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { BoardPlaceHolder } from '~ui-kit';
import './index.css';

import { WhiteboardToolbar } from '~containers/toolbar';
import { TrackArea } from '~containers/root-box/';

export const WhiteboardContainer: FC = observer(({ children }) => {
  const { boardUIStore } = useStore();
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    boardHeight,
    joinWhiteboardWhenConfigReady,
    leaveWhiteboard,
  } = boardUIStore;

  useEffect(() => {
    joinWhiteboardWhenConfigReady();
    return () => {
      leaveWhiteboard();
    };
  }, [leaveWhiteboard, joinWhiteboardWhenConfigReady]);

  const boardContainer = useMemo(
    () => (
      <div
        id="netless"
        ref={(dom) => {
          if (dom) {
            mount(dom);
          } else {
            unmount();
          }
        }}></div>
    ),
    [mount, unmount],
  );

  return (
    <div style={{ height: boardHeight }} className="w-full relative">
      <WhiteboardTrackArea />
      {readyToMount ? (
        <div className="whiteboard-wrapper">
          {children}
          <div className="whiteboard">
            {boardContainer}
            {connectionLost ? (
              <BoardPlaceHolder
                style={{ position: 'absolute' }}
                onReconnectClick={rejoinWhiteboard}
              />
            ) : null}
            <WhiteboardToolbar />
          </div>
        </div>
      ) : null}
    </div>
  );
});

export const CollectorContainer = observer(() => {
  const { boardUIStore } = useStore();
  const domRef = useRef(null);

  useEffect(() => {
    if (domRef.current) boardUIStore.setCollectorContainer = domRef.current;
  }, []);

  return <div id="window-manager-collector" ref={domRef}></div>;
});

export const WhiteboardTrackArea = () => {
  const { boardUIStore } = useStore();
  const { readyToMount } = boardUIStore;
  return readyToMount ? <TrackArea boundaryName="extapp-track-bounds" /> : null;
};
