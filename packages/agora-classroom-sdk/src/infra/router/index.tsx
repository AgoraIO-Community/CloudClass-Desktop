import { BizPagePath, BizPageRouter } from '@/infra/types';
import { HomePage } from '@/infra/debug-page/home';
import { LaunchPage } from '@/infra/debug-page/launch';
// import { OneToOne } from '@/ui-components/one-to-one';
// import { PretestPage } from '@/ui-components/pretest';
// import { SmallClassRoom } from '@/ui-components/small-class-room';
import { OneToOneScenario } from '@/ui-kit/capabilities/scenarios/1v1';
import { PretestScenarioPage } from '@/ui-kit/capabilities/scenarios/pretest';
import { EduRoomTypeEnum } from 'agora-rte-sdk';
import * as React from 'react';
import { scenarioRoomPath } from '@/infra/api';
import { MidClassScenario } from '@/ui-kit/capabilities/scenarios/mid-class';
import {BigClassScenario} from '@/ui-kit/capabilities/scenarios/big-class';
import { RecordPage } from '../debug-page/record';

export type AppRouteComponent = {
  path: string
  component: React.FC<any>
}

export const getLiveRoomPath = (roomType: EduRoomTypeEnum) => {
  const room = scenarioRoomPath[roomType]
  if (!room) {
    return BizPagePath.OneToOnePath
  }
  return room.path
}

// TODO: need fix tsx
const PageSFC = (Component: React.FC<any>) => {
  return <Component />
}
export const routesMap: Record<string, AppRouteComponent> = {
  // 一对一
  [BizPageRouter.OneToOne]: {
    path: '/classroom/1v1',
    component: () => PageSFC(OneToOneScenario)
  },
  // 观众端
  // [BizPageRouter.OneToOneIncognito]: {
  //   path: '/incognito/1v1',
  //   component: () => PageSFC(OneToOne)
  // },
  [BizPageRouter.MidClass]: {
    path: '/classroom/mid',
    component: () => PageSFC(MidClassScenario)
  },
  [BizPageRouter.BigClass]: {
    path: '/classroom/big',
    component: () => PageSFC(BigClassScenario)
  },
  // [BizPageRouter.SmallClassIncognito]: {
  //   path: '/incognito/small',
  //   component: () => PageSFC(SmallClassRoom)
  // },
  [BizPageRouter.TestRecordPage]: {
    path: '/record',
    component: () => PageSFC(RecordPage)
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage)
  },
  // 隐身模式，录屏功能
  // [BizPageRouter.Incognito]: {
  //   path: '/incognito',
  //   component: () => PageSFC(IncognitoPage)
  // },
  [BizPageRouter.PretestPage]: {
    path: '/pretest',
    component: () => PageSFC(PretestScenarioPage)
  },
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage)
  }
}