import React, { FC } from 'react';
import './index.css';
import emptyHistory from './assets/empty-history.png';

export const Placeholder: FC = () => (
  <div className="placeholder">
    <div>
      <img src={emptyHistory} alt="no messages" />
    </div>
    <div className="placeholder-desc">还没有消息</div>
  </div>
);
