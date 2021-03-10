import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import { IconTypes } from '~components/icon/icon-types';
import './index.css';

const toastDict: Record<string, {iconType: IconTypes, color: string}> = {
  success: {
    iconType: 'checked',
    color: '#357BF6'
  },
  error: {
    iconType: 'red-caution',
    color: '#F04C36'
  },
  warning: {
    iconType: 'red-caution',
    color: '#FFA229'
  }
}

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
      <Icon
        type={toastDict[type].iconType}
        color={toastDict[type].color}
      />
      {children}
    </div>
  );
};
