import React, { useEffect } from 'react';
import './style.css';
import { FcrBoardWidget } from '.';


export const App = ({ widget }: { widget: FcrBoardWidget }) => {
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
      <div
        className='window-manager-collector'
        ref={(ref) => {
          widget.collectorDom = ref;
        }} />
    </React.Fragment>
  );
};
