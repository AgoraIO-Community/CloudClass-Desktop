import React, { EventHandler, FC, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface ButtonProps extends BaseProps {
  type?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  action?: string;
  onClick?: EventHandler<SyntheticEvent<HTMLButtonElement>>;
}

export const Button: FC<ButtonProps> = ({
  type = 'primary',
  size = 'sm',
  disabled,
  children,
  className,
  action,
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
