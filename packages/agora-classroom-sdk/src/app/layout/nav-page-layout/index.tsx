import { FC, PropsWithChildren } from 'react';
import { NavHeader } from './header';
import './index.css';

type NavPageLayout = {
  title?: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  className?: string;
};
export const NavPageLayout: FC<PropsWithChildren<NavPageLayout>> = ({
  title,
  onBack,
  footer,
  children,
  className = '',
}) => {
  return (
    <div className={`nav-page-layout ${className}`}>
      <header>
        <NavHeader onBack={onBack}>{title}</NavHeader>
      </header>
      <div className={'content'}>{children}</div>
      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
};

export { NavFooter } from './footer';
export { NavHeader } from './header';
