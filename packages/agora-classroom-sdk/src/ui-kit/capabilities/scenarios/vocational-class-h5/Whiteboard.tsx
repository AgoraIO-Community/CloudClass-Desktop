import React, { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useVocationalH5UIStores } from '@/infra/hooks/use-edu-stores';
import { useEffect } from 'react';
import { BoardPlaceHolder } from '~ui-kit';
import cls from 'classnames';
import { useDrag } from './hooks/useDrag';

export interface WhiteboardProps {
  onClick?: React.EventHandler<React.MouseEvent>;
  minimized?: boolean;
}

const Whiteboard: FC<WhiteboardProps> = observer((props) => {
  const { minimized, onClick, children } = props;
  const { boardUIStore } = useVocationalH5UIStores();
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    joinWhiteboard,
    leaveWhiteboard,
  } = boardUIStore;
  const { x, y, isDragged, ...dragEvents } = useDrag();

  useEffect(() => {
    joinWhiteboard();
    return () => {
      leaveWhiteboard();
    };
  }, [leaveWhiteboard, joinWhiteboard]);
  const boardContainer = useMemo(
    () => (
      <div
        id="netless"
        ref={(dom) => {
          if (dom) {
            mount(dom, {
              prefersColorScheme: 'dark',
            });
          } else {
            unmount();
          }
        }}></div>
    ),
    [mount, unmount],
  );

  return (
    <div
      style={{
        transform: isDragged && minimized ? `translate(${x}px, ${y}px)` : '',
      }}
      className={cls({ 'vocational-whiteboard': 1, minimize: minimized })}>
      {readyToMount ? (
        <div className="whiteboard-wrapper">
          <div className="whiteboard-overlay" onClick={onClick} {...dragEvents} />
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
      ) : null}
    </div>
  );
});

export default Whiteboard;
