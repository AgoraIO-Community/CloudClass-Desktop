import { OneToOne } from '@/ui-components/one-to-one';
import { SmallClassRoom } from '@/ui-components/small-class-room';
import { SettingPage } from '@/ui-components/setting';
import { HomePage } from '@/ui-components/home';
import { LaunchPage } from '@/ui-components/launch';
import { IncognitoPage } from '@/ui-components/incognito'
import { PretestPage } from '@/ui-components/pretest';
import React from 'react';
import { BizPagePath, BizPageRouter } from '@/types';
import { EduRoomTypeEnum } from 'agora-rte-sdk';

export type AppRouteComponent = {
  path: string
  component: React.FC<any>
}

export const roomPath = {
  [EduRoomTypeEnum.Room1v1Class]: {
    path: BizPagePath.OneToOnePath,
  },
  [EduRoomTypeEnum.RoomSmallClass]: {
    path: BizPagePath.SmallClassPath,
  }
}

export const getLiveRoomPath = (roomType: EduRoomTypeEnum) => {
  const room = roomPath[roomType]
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
    component: () => PageSFC(OneToOne)
  },
  // 观众端
  [BizPageRouter.OneToOneIncognito]: {
    path: '/incognito/1v1',
    component: () => PageSFC(OneToOne)
  },
  [BizPageRouter.SmallClass]: {
    path: '/classroom/small',
    component: () => PageSFC(SmallClassRoom)
  },
  [BizPageRouter.SmallClassIncognito]: {
    path: '/incognito/small',
    component: () => PageSFC(SmallClassRoom)
  },
  [BizPageRouter.LaunchPage]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage)
  },
  // 隐身模式，录屏功能
  [BizPageRouter.Incognito]: {
    path: '/incognito',
    component: () => PageSFC(IncognitoPage)
  },
  [BizPageRouter.PretestPage]: {
    path: '/pretest',
    component: () => PageSFC(PretestPage)
  },
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage)
  }
}