import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import './index.css';

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
}
export const Icon: FC<IconProps> = ({
  type,
  className,
  style,
  size = 24,
  color = '#333',
  ...restProps
}) => {
  const cls = classnames({
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
  });
  return (
    <i
      className={cls}
      style={{
        color,
        fontSize: size,
        ...style,
      }}
      {...restProps}></i>
  );
};
