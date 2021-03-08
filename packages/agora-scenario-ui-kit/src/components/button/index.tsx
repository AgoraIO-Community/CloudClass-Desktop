import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseElementProps } from '~utilities';

export interface ButtonProps extends BaseElementProps {
  type?: 'primary' | 'danger';
  disabled?: boolean;
  large?: boolean;
}

export const Button: FC<ButtonProps> = ({ type = 'primary', disabled, children, large }) => {
  const cls = classnames({
    [`btn`]: 1,
    [`${type}`]: 1,
    [`large`]: !!large,
    [`small`]: !large,
    // [`active:outline-none`]: 1,
    // [`focus:outline-none`]: 1,
    [`disabled:opacity-50`]: !!disabled,
  });
  return (
    <button className={cls} disabled={disabled}>
      {children}
    </button>
  );
};