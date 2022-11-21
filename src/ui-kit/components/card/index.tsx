import React, { FC, EventHandler } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../../components/util/type';
import './index.css';

export interface CardProps extends BaseProps {
  width?: number;
  height?: number;
  borderRadius?: number | string;
  children?: React.ReactNode;
  onMouseDown?: EventHandler<any>;
  onMouseUp?: EventHandler<any>;
  onMouseLeave?: EventHandler<any>;
  onScroll?: EventHandler<any>;
}

export const Card: FC<CardProps> = ({
  width = 90,
  height = 90,
  borderRadius = 12,
  children,
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-card`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div
      className={cls}
      style={{
        width,
        height,
        borderRadius,
      }}
      {...restProps}>
      {children}
    </div>
  );
};
