import React, { FC, useContext } from 'react';
import classNames from 'classnames';
import { Card, SvgIcon, SvgIconEnum, themeContext } from '~ui-kit';
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
    mounted,
  } = boardUIStore;
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex + 1 === scenesCount;
  const { brand, iconPrimary } = useContext(themeContext);

  return mounted && (isTeacherOrAssistant || isGrantedBoard) && !isHost ? (
    <Card
      className={classNames('scenes-controller-container')}
      style={{ opacity: containedStreamWindowCoverOpacity }}>
      <div className="scenes-controller-btn-list">
        <div className="scenes-controller-btn" onClick={addMainViewScene}>
          <SvgIcon
            type={SvgIconEnum.ADD_SCENE}
            hoverType={SvgIconEnum.ADD_SCENE}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
          />
        </div>
        <div className="scenes-controller-line"></div>
        <div className="scenes-controller-btn" onClick={toPreMainViewScene}>
          <SvgIcon
            type={SvgIconEnum.BACKWARD}
            hoverType={SvgIconEnum.BACKWARD}
            colors={{
              iconPrimary: isFirstScene ? InteractionStateColors.disabled : iconPrimary,
            }}
            hoverColors={{
              iconPrimary: isFirstScene ? InteractionStateColors.disabled : brand,
            }}
            canHover={!isFirstScene}
          />
        </div>
        <div className="scenes-controller-info">
          {currentSceneIndex + 1} / {scenesCount}
        </div>
        <div className="scenes-controller-btn" onClick={toNextMainViewScene}>
          <SvgIcon
            type={SvgIconEnum.FORWARD}
            hoverType={SvgIconEnum.FORWARD}
            colors={{
              iconPrimary: isLastScene ? InteractionStateColors.disabled : iconPrimary,
            }}
            hoverColors={{
              iconPrimary: isLastScene ? InteractionStateColors.disabled : brand,
            }}
            canHover={!isLastScene}
          />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('undo')}>
          <SvgIcon
            type={SvgIconEnum.UNDO}
            hoverType={SvgIconEnum.UNDO}
            canHover={undoSteps !== 0}
            colors={{
              iconPrimary: undoSteps === 0 ? InteractionStateColors.disabled : iconPrimary,
            }}
            hoverColors={{
              iconPrimary: undoSteps === 0 ? InteractionStateColors.disabled : brand,
            }}
          />
        </div>
        <div className="scenes-controller-btn" onClick={() => setTool('redo')}>
          <SvgIcon
            type={SvgIconEnum.REDO}
            hoverType={SvgIconEnum.REDO}
            canHover={redoSteps !== 0}
            colors={{
              iconPrimary: redoSteps === 0 ? InteractionStateColors.disabled : iconPrimary,
            }}
            hoverColors={{
              iconPrimary: redoSteps === 0 ? InteractionStateColors.disabled : brand,
            }}
          />
        </div>
      </div>
    </Card>
  ) : null;
});
