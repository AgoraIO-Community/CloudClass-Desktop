import * as React from 'react';
import { BizPageRouter } from '@/infra/types';
import { HomePage } from '@/infra/pages/home';
import { HomeH5Page } from '@/infra/pages/home/h5';
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
  [BizPageRouter.RecordationSearchPage]: {
    path: '/recordation-search/:p',
    component: () => PageSFC(RecordationSearchPage),
  },
  [BizPageRouter.Window]: {
    path: '/window',
    component: () => PageSFC(LaunchWindow),
  },
};
