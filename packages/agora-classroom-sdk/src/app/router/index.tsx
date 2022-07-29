import { useAuth } from '@/infra/hooks/auth';
import React, { FC } from 'react';
import { HomePage } from '../pages/home';
import { HomeH5Page } from '../pages/home/h5';
import { VocationalHomePage } from '../pages/home/vocational';
import { VocationalHomeH5Page } from '../pages/home/vocational-h5';
import { LaunchPage } from '../pages/launch';
import { LaunchWindow } from '../pages/launch-window';
import { RecordationSearchPage } from '../pages/recordation-search';
import { BizPageRouter } from './type';

export type AppRouteComponent = {
  path: string;
  component: React.FC;
};

const PageSFC = (Component: React.FC) => {
  return <Component />;
};

const AuthLayout: FC = ({ children }) => {
  const { auth } = useAuth();
  React.useEffect(() => {
    // auth();
  }, []);

  return <>{children}</>;
};
export const routesMap: Record<string, AppRouteComponent> = {
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage),
  },
  [BizPageRouter.ShareLinkPage]: {
    path: '/share',
    component: () => PageSFC(HomePage),
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
  },
  [BizPageRouter.TestH5HomePage]: {
    path: '/h5login',
    component: () => <HomeH5Page />,
  },
  [BizPageRouter.VocationalHomePage]: {
    path: '/vocational',
    component: () => (
      <AuthLayout>
        <VocationalHomePage />
      </AuthLayout>
    ),
  },
  [BizPageRouter.VocationalHomeH5Page]: {
    path: '/vocational/h5login',
    component: () => (
      <AuthLayout>
        <VocationalHomeH5Page />
      </AuthLayout>
    ),
  },
  [BizPageRouter.RecordationSearchPage]: {
    path: '/recordation-search/:p',
    component: () => PageSFC(RecordationSearchPage),
  },
  [BizPageRouter.Window]: {
    path: '/window',
    component: () => PageSFC(LaunchWindow),
  },
};
