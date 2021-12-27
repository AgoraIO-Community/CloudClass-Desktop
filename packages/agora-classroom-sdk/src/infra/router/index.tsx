import { BizPageRouter } from '@/infra/types';
import { HomePage } from '@/infra/pages/home';
import { HomeH5Page } from '@/infra/pages/home/h5';
import { Home } from '@/infra/pages/home/home';
import { LaunchPage } from '@/infra/pages/launch';
import { OneToOneScenario } from '~capabilities/scenarios/1v1';
import * as React from 'react';
import { MidClassScenario } from '~capabilities/scenarios/mid-class';
import { BigClassScenario } from '~capabilities/scenarios/big-class';
// import { RecordPage } from '../pages/record';

export type AppRouteComponent = {
  path: string;
  component: React.FC<any>;
};

// TODO: need fix tsx
const PageSFC = (Component: React.FC<any>) => {
  return <Component />;
};
export const routesMap: Record<string, AppRouteComponent> = {
  // 一对一
  [BizPageRouter.OneToOne]: {
    path: '/classroom/1v1',
    component: () => PageSFC(OneToOneScenario),
  },
  // 观众端
  // [BizPageRouter.OneToOneIncognito]: {
  //   path: '/incognito/1v1',
  //   component: () => PageSFC(OneToOne)
  // },
  [BizPageRouter.MidClass]: {
    path: '/classroom/mid',
    component: () => PageSFC(MidClassScenario),
  },
  [BizPageRouter.BigClass]: {
    path: '/classroom/big',
    component: () => PageSFC(BigClassScenario),
  },
  // [BizPageRouter.SmallClassIncognito]: {
  //   path: '/incognito/small',
  //   component: () => PageSFC(SmallClassRoom)
  // },
  // [BizPageRouter.TestRecordPage]: {
  //   path: '/record',
  //   component: () => PageSFC(RecordPage),
  // },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
  },
  // 隐身模式，录屏功能
  // [BizPageRouter.Incognito]: {
  //   path: '/incognito',
  //   component: () => PageSFC(IncognitoPage)
  // },
  [BizPageRouter.TestAdapteHomePage]: {
    path: '/',
    component: () => PageSFC(Home()),
  },
};
