import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { BaseProps } from '../util/type';

export interface FloatProps extends BaseProps {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  direction?: 'row' | 'col';
  align?: 'flex-start' | 'flex-end';
  justify?: 'start' | 'end';
  gap: number;
}

export const Float: FC<PropsWithChildren<FloatProps>> = ({
  top,
  left,
  bottom,
  right,
  children,
  direction = 'row',
  align,
  justify,
  gap,
}) => {
  const cls = classNames(
    'fcr-absolute fcr-z-50 fcr-flex',
    direction === 'row' ? 'fcr-flex-row' : 'fcr-flex-col',
    `fcr-gap-${gap ?? 0}`,
  );
  return (
    <div
      className={cls}
      style={{ bottom, right, top, left, alignItems: align, justifyContent: justify }}>
      {children}
    </div>
  );
};
