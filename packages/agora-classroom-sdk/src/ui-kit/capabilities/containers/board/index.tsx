import { observer } from 'mobx-react';
import { FC, useEffect, useRef } from 'react';
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
          <BoardWrapper />
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

const BoardWrapper = observer(() => {
  const { boardUIStore } = useStore();
  const { mount, unmount } = boardUIStore;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      mount(divRef.current);
    }
    return () => {
      unmount();
    };
  }, []);

  return <div id="netless" ref={divRef} />;
});

export const CollectorContainer = observer(() => {
  const { boardUIStore } = useStore();
  return (
    <div
      id="window-manager-collector"
      ref={(domRef) => domRef && (boardUIStore.collectorContainer = domRef)}></div>
  );
});
