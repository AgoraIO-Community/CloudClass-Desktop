import { observer } from 'mobx-react';
import { FC, useMemo, useEffect, useRef } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { BoardPlaceHolder } from '~ui-kit';
import './index.css';

import { WhiteboardToolbar } from '~containers/toolbar';
import { TrackArea } from '~containers/root-box/';
import { ScenesController } from '../scenes-controller';

export const WhiteboardContainer: FC<{ trackAreaOffsetLevel?: number }> = observer(
  ({ children, trackAreaOffsetLevel }) => {
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
      currentSceneIndex,
      scenesCount,
      addMainViewScene,
      toPreMainViewScene,
      toNextMainViewScene,
      isGrantedBoard,
      isTeacherOrAssistant,
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
      <div style={{ height: boardHeight }} className="w-full relative flex-shrink-0">
        <WhiteboardTrackArea trackAreaOffsetLevel={trackAreaOffsetLevel} />
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
              {(isTeacherOrAssistant || isGrantedBoard) && (
                <ScenesController
                  addScene={addMainViewScene}
                  preScene={toPreMainViewScene}
                  nextScene={toNextMainViewScene}
                  currentSceneIndex={currentSceneIndex}
                  scenesCount={scenesCount}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

export const CollectorContainer = observer(() => {
  const { boardUIStore } = useStore();
  return (
    <div
      id="window-manager-collector"
      ref={(domRef) => domRef && (boardUIStore.collectorContainer = domRef)}></div>
  );
});

export const WhiteboardTrackArea = ({
  trackAreaOffsetLevel,
}: {
  trackAreaOffsetLevel?: number;
}) => {
  const { boardUIStore } = useStore();
  const { readyToMount } = boardUIStore;
  return readyToMount ? (
    <TrackArea boundaryName="extapp-track-bounds" offsetLevel={trackAreaOffsetLevel} />
  ) : null;
};
