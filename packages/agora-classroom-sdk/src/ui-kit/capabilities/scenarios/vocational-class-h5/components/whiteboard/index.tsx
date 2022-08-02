import { useVocationalH5UIStores } from '@/infra/hooks/ui-store';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';
import { ComponentLevelRules } from '@/ui-kit/capabilities/config';
import { ScreenShareContainer } from '@/ui-kit/capabilities/containers/screen-share';
import { default as classnames, default as cls } from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { SvgImg } from '~ui-kit';
import { useDrag } from '../../hooks/useDrag';
import './index.css';

interface MobileWhiteBoardProps {
  onClick?: React.EventHandler<React.MouseEvent>;
  minimized: boolean;
}

export const WhiteboardH5 = observer(function Board() {
  const {
    boardUIStore,
    streamUIStore: { containerH5VisibleCls },
  } = useVocationalH5UIStores() as EduVocationalH5UIStore;

  const {
    iconBorderZoomType,
    iconZoomVisibleCls,
    handleBoradZoomStatus,
    boardContainerHeight,
    boardContainerWidth,
  } = boardUIStore;

  return (
    <div
      className={classnames(
        'whiteboard-h5-container w-full h-full relative',
        containerH5VisibleCls,
      )}
      style={{ height: boardContainerHeight, width: boardContainerWidth }}>
      <div
        style={{
          height: boardContainerHeight,
          width: boardContainerWidth,
          zIndex: ComponentLevelRules.WhiteBoard,
        }}
        className="widget-slot-board"
      />
      <SvgImg
        type={iconBorderZoomType}
        className={classnames('whiteboard-zoom-status', iconZoomVisibleCls)}
        onClick={handleBoradZoomStatus}
      />
    </div>
  );
});

export const MobileWhiteBoardH5 = observer<FC<MobileWhiteBoardProps>>(({ onClick, minimized }) => {
  const { x, y, isDragged, ...dragEvents } = useDrag();

  return (
    <div
      style={{
        transform: isDragged && minimized ? `translate(${x}px, ${y}px)` : '',
      }}
      className={cls({ 'vocational-whiteboard': 1, minimize: minimized })}>
      <div className="whiteboard-wrapper w-full h-full max-w-full">
        <div className="whiteboard-overlay" onClick={onClick} {...dragEvents} />
        <div className="whiteboard">
          <WhiteboardH5 />
          <ScreenShareContainer className="top-0" />
        </div>
      </div>
    </div>
  );
});
