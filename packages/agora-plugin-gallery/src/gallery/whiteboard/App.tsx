import React, { useEffect } from 'react';
import { Button, transI18n } from '~ui-kit';
import disconnectedImg from './assets/disconnected.png';
import './style.css';
import { FcrBoardWidget } from '.';

export const App = ({ widget }: { widget: FcrBoardWidget }) => {
  const connectionLost = false;

  useEffect(() => {
    widget.mount();
    return () => {
      widget.unmount();
    }
  }, []);

  return (
    <React.Fragment>
      <div
        className='h-full'
        onDragOver={widget.handleDragOver}
        onDrop={widget.handleDrop}
        ref={(ref) => {
          widget.boardDom = ref;
        }}
      />
      {connectionLost ? <DisconnectedTip onReconnectClick={widget.tryReconnect} /> : null}
      <div
        className='window-manager-collector'
        ref={(ref) => {
          widget.collectorDom = ref;
        }} />
    </React.Fragment>
  );
};

const DisconnectedTip: React.FC<{ onReconnectClick: () => void }> = ({ onReconnectClick }) => {
  return (
    <div className="board-placeholder absolute">
      <img src={disconnectedImg} alt={transI18n('whiteboard.disconnect-img-alt')} />
      <Button className="reconnect-btn" onClick={onReconnectClick}>
        {transI18n('whiteboard.disconnect-btn')}
      </Button>
    </div>
  );
};
