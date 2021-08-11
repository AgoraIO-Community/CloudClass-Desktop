import { BizPagePath, BizPageRouter } from '@/infra/types';
import { HomePage } from '@/infra/debug-page/home';
import { LaunchPage } from '@/infra/debug-page/launch';
import { OneToOneScenario } from '~capabilities/scenarios/1v1';
import { PretestScenarioPage } from '~capabilities/scenarios/pretest';
import { EduRoomTypeEnum } from 'agora-edu-core';
import * as React from 'react';
import { MidClassScenario } from '~capabilities/scenarios/mid-class';
import { BigClassScenario } from '~capabilities/scenarios/big-class';
import { RecordPage } from '../debug-page/record';

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
  [BizPageRouter.TestRecordPage]: {
    path: '/record',
    component: () => PageSFC(RecordPage),
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
  },
  // 隐身模式，录屏功能
  // [BizPageRouter.Incognito]: {
  //   path: '/incognito',
  //   component: () => PageSFC(IncognitoPage)
  // },
  [BizPageRouter.PretestPage]: {
    path: '/pretest',
    component: () => PageSFC(PretestScenarioPage),
  },
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage),
  },
};
