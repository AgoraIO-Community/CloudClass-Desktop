import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface ButtonProps extends BaseProps {
  type?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'lg';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  type = 'primary',
  size = 'sm',
  disabled,
  children,
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`btn btn-${size} btn-${type}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <button className={cls} disabled={disabled} {...restProps}>
      {children}
    </button>
  );
};
