import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseElementProps } from '~utilities';

export interface ButtonProps extends BaseElementProps {
  type?: 'primary' | 'danger';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ type = 'primary', disabled, children }) => {
  const cls = classnames({
    [`btn`]: 1,
    [`text-white bg-primary`]: type === 'primary',
    [`text-red-500 border border-red-500`]: type === 'danger',
    [`active:outline-none`]: 1,
    [`focus:outline-none`]: 1,
    [`disabled:opacity-50`]: !!disabled,
  });
  return (
    <button className={cls} disabled={disabled}>
      {children}
    </button>
  );
};