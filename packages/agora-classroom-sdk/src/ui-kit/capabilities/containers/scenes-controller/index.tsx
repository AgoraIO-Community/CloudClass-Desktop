import React, { FC } from 'react';
import classNames from 'classnames';
import { Card, SvgIcon, SvgImg } from '~ui-kit';
import './index.css';

export interface ScenesControllerProps {
  addScene: () => void;
  preScene: () => void;
  nextScene: () => void;
  currentSceneIndex: number;
  scenesCount: number;
}

export const ScenesController: FC<ScenesControllerProps> = ({
  addScene,
  preScene,
  nextScene,
  currentSceneIndex,
  scenesCount,
}) => {
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex + 1 === scenesCount;

  return (
    <Card className={classNames('scenes-controller-container')}>
      <div className="scenes-controller-btn-list">
        <div className="scenes-controller-btn" onClick={addScene}>
          <SvgIcon type="add-scene" canHover hoverType="add-scene-active" />
        </div>
        <div className="scenes-controller-line"></div>
        <div className="scenes-controller-btn" onClick={preScene}>
          <SvgImg
            type="backward"
            canHover
            className={isFirstScene ? 'backward-disabled' : 'backward-enabled'}
          />
        </div>
        <div className="scenes-controller-info">
          {currentSceneIndex + 1} / {scenesCount}
        </div>
        <div className="scenes-controller-btn" onClick={nextScene}>
          <SvgImg
            type="forward"
            canHover
            className={isLastScene ? 'forward-disabled' : 'forward-enabled'}
          />
        </div>
      </div>
    </Card>
  );
};
