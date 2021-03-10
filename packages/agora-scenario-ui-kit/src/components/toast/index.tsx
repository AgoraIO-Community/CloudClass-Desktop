import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import './index.css';

export interface ToastProps extends BaseProps {
  type?: 'success' | 'error' | 'warning';
}

export const Toast: FC<ToastProps> = ({
  type = 'success',
  children,
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`toast toast-${type}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      <Icon type={
        type === 'success' ? 'checked' : 'red-caution'
      } />
      {children}
    </div>
  );
};
