import React, { FC } from 'react';
import classNames from 'classnames';
import { Card, SvgIcon, SvgIconEnum } from '~ui-kit';
import './index.css';
import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';

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
    mounted
  } = boardUIStore;
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex + 1 === scenesCount;
  return mounted && (isTeacherOrAssistant || isGrantedBoard) && !isHost ? (
    <Card
      className={classNames('scenes-controller-container')}
      style={{ opacity: containedStreamWindowCoverOpacity }}>
      <div className="scenes-controller-btn-list">
        <div className="scenes-controller-btn" onClick={addMainViewScene}>
          <SvgIcon type={SvgIconEnum.ADD_SCENE} hoverType={SvgIconEnum.ADD_SCENE} hoverColors={{ iconPrimary: InteractionStateColors.allow }} />
        </div>
        <div className="scenes-controller-line"></div>
        <div className="scenes-controller-btn" onClick={toPreMainViewScene}>
          <SvgIcon
            type={SvgIconEnum.BACKWARD}
            hoverType={SvgIconEnum.BACKWARD}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
            className={isFirstScene ? 'backward-disabled' : 'backward-enabled'}
          />
        </div>
        <div className="scenes-controller-info">
          {currentSceneIndex + 1} / {scenesCount}
        </div>
        <div className="scenes-controller-btn" onClick={toNextMainViewScene}>
          <SvgIcon
            type={SvgIconEnum.FORWARD}
            hoverType={SvgIconEnum.FORWARD}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
            className={isLastScene ? 'forward-disabled' : 'forward-enabled'}
          />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('undo')}>
          <SvgIcon type={SvgIconEnum.UNDO} className={undoSteps === 0 ? 'undo-disabled' : 'undo'}
            hoverType={SvgIconEnum.UNDO}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }} />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('redo')}>
          <SvgIcon type={SvgIconEnum.REDO} className={redoSteps === 0 ? 'redo-disabled' : 'redo'}
            hoverType={SvgIconEnum.REDO}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }} />
        </div>
      </div>
    </Card>
  ) : null;
});
