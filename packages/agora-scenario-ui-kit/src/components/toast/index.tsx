import React, { CSSProperties, FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import { IconTypes } from '~components/icon/icon-types';
import Notification from 'rc-notification'
import './index.css';

const toastDict: Record<string, { iconType: IconTypes, color: string }> = {
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
  text?: string;
  duration?: number;
}

type ToastType = FC<ToastProps> & {
  show: (params: ToastProps) => void,
}

export const Toast: ToastType = ({
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

Toast.show = function ({
  type = 'success',
  text = 'toast text',
  duration = 1.5,
  style = {
    top: 0,
    right: 0,
  }
}) {
  Notification.newInstance({}, notification => {
    notification.notice({
      content: <Toast type={type as 'success' | 'error' | 'warning'}>{text}</Toast>,
      duration,
      style: Object.assign({position: 'fixed'}, style) as CSSProperties
    });
  });
}
