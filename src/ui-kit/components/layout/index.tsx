import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import './index.css';

export interface LayoutProps extends BaseProps {
  direction?: 'row' | 'col' | 'col-reverse';
  children?: React.ReactNode;
}

export const Layout: FC<LayoutProps> = ({
  direction = 'row',
  className,
  children,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-layout fcr-layout-${direction}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  );
};

export const Header: FC<BaseProps> = ({ className, children, ...restProps }) => {
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

export const Aside: FC<BaseProps> = ({ className, children, ...restProps }) => {
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

export const Content: FC<BaseProps> = ({ className, children, ...restProps }) => {
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
