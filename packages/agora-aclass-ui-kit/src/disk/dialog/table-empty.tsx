import React from 'react';
import IconEmpty from '../assets/icon-empty.png'

const TableEmpty = () => {
  const render = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '50px',
        flexFlow: 'column',
      }}>
        <img src={IconEmpty} />
        <div style={{ color: '#A9AEC5', fontSize: '14px' }}>暂无文件</div>
      </div>
    );
  };
  return render();
};

export default TableEmpty;