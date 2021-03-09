import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface LayoutProps extends BaseProps {
  direction?: ' row' | 'col';
}

export const Layout: FC<LayoutProps> = ({
  direction = 'row',
  className,
  children,
  ...restProps
}) => {
  const cls = classnames({
    [`layout layout-${direction}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div {...restProps} className={cls}>
      {children}
    </div>
  );
};

export const Header: FC<BaseProps> = ({
  className,
  children,
  ...restProps
}) => {
  const cls = classnames({
    [`layout-header`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <header {...restProps} className={cls}>
      {children}
    </header>
  );
};

export const Aside: FC<BaseProps> = ({ className, children, ...restProps }) => {
  const cls = classnames({
    [`layout-aside`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <aside {...restProps} className={cls}>
      {children}
    </aside>
  );
};

export const Content: FC<BaseProps> = ({
  className,
  children,
  ...restProps
}) => {
  const cls = classnames({
    [`layout-content`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <section {...restProps} className={cls}>
      {children}
    </section>
  );
};

export default Layout;
