import React, { EventHandler, FC, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import './index.css';

export type { IconTypes } from './icon-types';

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  onClick?: EventHandler<SyntheticEvent<HTMLElement>>;
}

export const Icon: FC<IconProps> = ({
  type,
  className,
  style,
  size,
  color,
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
