import { observer } from 'mobx-react';
import { FC, useMemo, useEffect } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { BoardPlaceHolder } from '~ui-kit';
import './index.css';

import { ScenesController } from '../scenes-controller';

export const WhiteboardContainer: FC = observer(({ children }) => {
  const { boardUIStore, toolbarUIStore } = useStore();
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    joinWhiteboardWhenConfigReady,
    leaveWhiteboard,
    currentSceneIndex,
    scenesCount,
    addMainViewScene,
    toPreMainViewScene,
    toNextMainViewScene,
    isGrantedBoard,
    isTeacherOrAssistant,
    redoSteps,
    undoSteps,
  } = boardUIStore;
  const { setTool } = toolbarUIStore;
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
  return readyToMount ? (
    <>
      {(isTeacherOrAssistant || isGrantedBoard) && (
        <ScenesController
          addScene={addMainViewScene}
          preScene={toPreMainViewScene}
          nextScene={toNextMainViewScene}
          currentSceneIndex={currentSceneIndex}
          scenesCount={scenesCount}
          redoSteps={redoSteps}
          undoSteps={undoSteps}
          redo={() => {
            setTool('redo');
          }}
          undo={() => {
            setTool('undo');
          }}
        />
      )}

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
        </div>
      </div>
    </>
  ) : null;
});

export const CollectorContainer = observer(() => {
  const { boardUIStore } = useStore();
  return (
    <div
      id="window-manager-collector"
      ref={(domRef) => domRef && (boardUIStore.collectorContainer = domRef)}></div>
  );
});
