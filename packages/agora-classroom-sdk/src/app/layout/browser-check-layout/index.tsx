import { isH5Browser } from '@/app/utils/browser';
import { FC, PropsWithChildren, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';

type BrowserCheckLayoutProps = {
  includes?: string[];
  exclude?: string[];
};
export const BrowserCheckLayout: FC<PropsWithChildren<BrowserCheckLayoutProps>> = ({
  children,
  includes = [],
  exclude = [],
}) => {
  const location = useLocation();
  const history = useHistory();
  useEffect(() => {
    if (exclude.includes(location.pathname) || !includes.includes(location.pathname)) {
      return;
    }
    // redirect to h5
    if (isH5Browser() && !location.pathname.match('/h5')) {
      const url = window.location.hash.replace('#/', '/h5');
      history.push(url);
      return;
    }
    // redirect to pc
    if (!isH5Browser() && location.pathname.match('/h5')) {
      const url = window.location.hash.replace('#/h5', '');
      history.push(url);
    }
  }, [exclude, includes, location.pathname]);

  return <>{children}</>;
};
