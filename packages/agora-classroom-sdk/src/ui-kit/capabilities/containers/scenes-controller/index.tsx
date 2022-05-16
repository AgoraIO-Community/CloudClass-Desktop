import React, { FC } from 'react';
import classNames from 'classnames';
import { Card, SvgIcon, SvgImg } from '~ui-kit';
import './index.css';
import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/use-edu-stores';

export const ScenesController: FC = observer(() => {
  const {
    boardUIStore,
    classroomStore: {
      remoteControlStore: { isHost },
    },
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
    toolbarUIStore: { setTool },
  } = useStore();

  const {
    currentSceneIndex,
    scenesCount,
    addMainViewScene,
    toPreMainViewScene,
    toNextMainViewScene,
    redoSteps,
    undoSteps,
    isGrantedBoard,
    isTeacherOrAssistant,
  } = boardUIStore;
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex + 1 === scenesCount;
  return (isTeacherOrAssistant || isGrantedBoard) && !isHost ? (
    <Card
      className={classNames('scenes-controller-container')}
      style={{ opacity: containedStreamWindowCoverOpacity }}>
      <div className="scenes-controller-btn-list">
        <div className="scenes-controller-btn" onClick={addMainViewScene}>
          <SvgIcon type="add-scene" canHover hoverType="add-scene-active" />
        </div>
        <div className="scenes-controller-line"></div>
        <div className="scenes-controller-btn" onClick={toPreMainViewScene}>
          <SvgImg
            type="backward"
            canHover
            className={isFirstScene ? 'backward-disabled' : 'backward-enabled'}
          />
        </div>
        <div className="scenes-controller-info">
          {currentSceneIndex + 1} / {scenesCount}
        </div>
        <div className="scenes-controller-btn" onClick={toNextMainViewScene}>
          <SvgImg
            type="forward"
            canHover
            className={isLastScene ? 'forward-disabled' : 'forward-enabled'}
          />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('undo')}>
          <SvgImg type="undo" canHover className={undoSteps === 0 ? 'undo-disabled' : 'undo'} />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('redo')}>
          <SvgImg type="redo" canHover className={redoSteps === 0 ? 'redo-disabled' : 'redo'} />
        </div>
      </div>
    </Card>
  ) : null;
});
