import React, { ReactNode } from 'react';
import './maskCountDown.css';

export const MaskCountDown = ({
  content,
  enable,
  children,
}: {
  content: ReactNode;
  enable: boolean;
  children: ReactNode;
}) => {
  return enable ? (
    <div className="mask-count-down">
      {children}
      <div className="mask-top">{content}</div>
    </div>
  ) : (
    <> {children}</>
  );
};
