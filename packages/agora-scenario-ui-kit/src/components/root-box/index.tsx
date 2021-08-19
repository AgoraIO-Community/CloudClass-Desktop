import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../interface/base-props';
import './index.css';

export interface RootBoxProps extends BaseProps {}

export const RootBox: FC<RootBoxProps> = ({ children, className, ...restProps }) => {
  const cls = classnames({
    [`root-box`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  );
};
