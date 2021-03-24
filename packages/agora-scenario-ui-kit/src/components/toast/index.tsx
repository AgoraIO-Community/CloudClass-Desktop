import React, { CSSProperties, FC, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import { IconTypes } from '~components/icon/icon-types';
import Notification from 'rc-notification'
import './index.css';

export const useMounted = () => {
  const mounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])
  return mounted.current
}

export const useTimeout = (fn: CallableFunction, delay: number) => {
  const mounted = useMounted()

  const timer = useRef<any>(null)

  useEffect(() => {
    timer.current = setTimeout(() => {
      fn && mounted && fn()
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }, delay)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [timer])
}

export type ToastCategory = 'success' | 'error' | 'warning'

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
  closeToast?: CallableFunction
}

type ToastType = FC<ToastProps> & {
  show: (params: ToastProps) => void,
}

export const Toast: ToastType = ({
  type = 'success',
  children,
  className,
  closeToast,
  ...restProps
}) => {
  const cls = classnames({
    [`toast toast-${type}`]: 1,
    [`${className}`]: !!className,
  });

  useTimeout(() => {
    closeToast && closeToast()
  }, 2500)

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
