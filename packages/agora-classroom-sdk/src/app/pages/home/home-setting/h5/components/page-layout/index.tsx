import { FC, PropsWithChildren } from 'react';
import './index.css';
export interface PageLayoutProps {
  title: string;
  onBack?: () => void;
}

export const PageLayout: FC<PropsWithChildren<PageLayoutProps>> = ({ title, onBack, children }) => {
  return (
    <div className="h5-page-layout w-full h-full flex flex-col">
      <div className="header">
        {title}
        <div className="back absolute left-0 top-0" onClick={onBack}></div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};
