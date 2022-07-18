import * as React from 'react';
import { HomePage } from '@/infra/pages/home';
import { HomeH5Page } from '@/infra/pages/home/h5';
import { VocationalHomePage } from '@/infra/pages/home/vocational';
import { VocationalHomeH5Page } from '@/infra/pages/home/vocational-h5';
import { LaunchPage } from '@/infra/pages/launch';
import { LaunchWindow } from '@/infra/pages/launch-window';
import { RecordationSearchPage } from '@/infra/pages/recordation-search';
import { OneToOneScenario } from '~capabilities/scenarios/1v1';
import { MidClassScenario } from '~capabilities/scenarios/mid-class';
import { BigClassScenario } from '~capabilities/scenarios/big-class';

export type AppRouteComponent = {
  path: string;
  component: React.FC<any>;
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

// TODO: need fix tsx
const PageSFC = (Component: React.FC<any>) => {
  return <Component />;
};
export const routesMap: Record<string, AppRouteComponent> = {
  [BizPageRouter.OneToOne]: {
    path: '/classroom/1v1',
    component: () => PageSFC(OneToOneScenario),
  },
  [BizPageRouter.MidClass]: {
    path: '/classroom/mid',
    component: () => PageSFC(MidClassScenario),
  },
  [BizPageRouter.BigClass]: {
    path: '/classroom/big',
    component: () => PageSFC(BigClassScenario),
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
  },
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage),
  },
  [BizPageRouter.TestH5HomePage]: {
    path: '/h5login',
    component: () => PageSFC(HomeH5Page),
  },
  [BizPageRouter.VocationalHomePage]: {
    path: '/vocational',
    component: () => PageSFC(VocationalHomePage),
  },
  [BizPageRouter.VocationalHomeH5Page]: {
    path: '/vocational/h5login',
    component: () => PageSFC(VocationalHomeH5Page),
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
