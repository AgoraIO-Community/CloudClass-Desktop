import { FC, PropsWithChildren } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import './index.css';

export type RootBoxProps = BaseProps;

export const RootBox: FC<PropsWithChildren<RootBoxProps>> = ({
  children,
  className,
  ...restProps
}) => {
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
