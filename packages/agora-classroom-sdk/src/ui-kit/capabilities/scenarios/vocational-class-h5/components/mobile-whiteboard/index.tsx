import { ScreenShareContainer } from '@/ui-kit/capabilities/containers/screen-share';
import { Whiteboard } from '@/ui-kit/capabilities/containers/widget/slots';
import cls from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { useDrag } from '../../hooks/useDrag';
import './index.css';

interface MobileWhiteBoardProps {
  onClick?: React.EventHandler<React.MouseEvent>;
  minimized: boolean;
}

export const MobileWhiteBoard = observer<FC<MobileWhiteBoardProps>>(({ onClick, minimized }) => {
  const { x, y, isDragged, ...dragEvents } = useDrag();
  return (
    <div
      style={{
        transform: isDragged && minimized ? `translate(${x}px, ${y}px)` : '',
      }}
      className={cls({ 'vocational-whiteboard': 1, minimize: minimized })}>
      <div className="whiteboard-wrapper w-full h-full">
        <div className="whiteboard-overlay" onClick={onClick} {...dragEvents} />
        <div className="whiteboard">
          <Whiteboard />
          <ScreenShareContainer />
        </div>
      </div>
    </div>
  );
});
