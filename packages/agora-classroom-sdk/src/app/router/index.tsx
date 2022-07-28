import { useAuth } from '@/infra/hooks/auth';
import React, { FC } from 'react';
import { LaunchPage } from '../pages/launch';
import { HomeH5Page } from '../pages/home/h5';
import { VocationalHomePage } from '../pages/home/vocational';
import { VocationalHomeH5Page } from '../pages/home/vocational-h5';
import { RecordationSearchPage } from '../pages/recordation-search';
import { LaunchWindow } from '../pages/launch-window';
import { HomePage } from '../pages/home';


export type AppRouteComponent = {
  path: string;
  component: React.FC;
};

export enum BizPageRouter {
  Setting = 'setting',
  OneToOne = '1v1',
  MidClass = 'small',
  BigClass = 'big',
  OneToOneIncognito = '1v1_incognito',
  SmallClassIncognito = 'small_incognito',
  LaunchPage = 'launch',
  PretestPage = 'pretest',
  TestHomePage = 'test_home',
  Incognito = 'Incognito',
  TestRecordPage = 'test_record',
  TestH5HomePage = 'test_h5_home',
  TestAdapteHomePage = 'test_adapte_home',
  RecordationSearchPage = 'recordation-search',
  Window = 'window',
  VocationalHomePage = 'vocational_home',
  VocationalHomeH5Page = 'vocational_h5_home',
}

const PageSFC = (Component: React.FC) => {
  return <Component />;
};

const AuthLayout: FC = ({ children }) => {
  const { auth } = useAuth();
  React.useEffect(() => {
    auth();
  }, []);

  return <>{children}</>;
};
export const routesMap: Record<string, AppRouteComponent> = {
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage),
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
  },
  [BizPageRouter.TestH5HomePage]: {
    path: '/h5login',
    component: () => (
      <AuthLayout>
        <HomeH5Page />
      </AuthLayout>
    ),
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
