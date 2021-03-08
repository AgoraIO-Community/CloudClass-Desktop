import React, { CSSProperties, FC } from 'react';
import classnames from 'classnames';

export interface LayoutGeneralProps {
  style?: CSSProperties;
  className?: string;
}
export interface LayoutProps extends LayoutGeneralProps {
  direction?: ' row' | 'col';
}

export const Layout: FC<LayoutProps> = ({
  direction = 'row',
  style,
  className,
  children,
}) => {
  const cls = classnames({
    [`flex flex-${direction}`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
};

export const Header: FC<LayoutGeneralProps> = ({
  className,
  style,
  children,
}) => {
  const cls = classnames({
    [`flex flex-row border-b border-gray-100 h-12 w-full`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <header style={style} className={cls}>
      {children}
    </header>
  );
};

export const Aside: FC<LayoutGeneralProps> = ({
  className,
  style,
  children,
}) => {
  const cls = classnames({
    [`flex flex-col border-l border-gray-100 w-72 h-full`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <aside style={style} className={cls}>
      {children}
    </aside>
  );
};

export const Content: FC<LayoutGeneralProps> = ({
  className,
  style,
  children,
}) => {
  const cls = classnames({
    [`flex flex-row h-full flex-1`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <section style={style} className={cls}>
      {children}
    </section>
  );
};

export default Layout;