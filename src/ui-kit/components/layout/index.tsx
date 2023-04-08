import React, { FC, PropsWithChildren } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import './index.css';

export interface LayoutProps extends BaseProps {
  direction?: 'row' | 'col' | 'col-reverse';
  children?: React.ReactNode;
  onClick?: () => void;
}

export const Layout: FC<LayoutProps> = ({
  direction = 'row',
  className,
  children,
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-layout fcr-layout-${direction}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div onClick={onClick} className={cls} {...restProps}>
      {children}
    </div>
  );
};

export const Header: FC<PropsWithChildren<BaseProps>> = ({ className, children, ...restProps }) => {
  const cls = classnames({
    [`fcr-layout-header`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <header className={cls} {...restProps}>
      {children}
    </header>
  );
};

export const Aside: FC<PropsWithChildren<BaseProps>> = ({ className, children, ...restProps }) => {
  const cls = classnames({
    [`fcr-layout-aside`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <aside className={cls} {...restProps}>
      {children}
    </aside>
  );
};

export const Content: FC<PropsWithChildren<BaseProps>> = ({
  className,
  children,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-layout-content`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <section className={cls} {...restProps}>
      {children}
    </section>
  );
};
