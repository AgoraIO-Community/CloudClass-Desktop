import { OneToOne } from '@/pages/one-to-one';
import { SmallClassRoom } from '@/pages/small-class-room';
import { SettingPage } from '@/pages/setting';
import { HomePage } from '@/pages/home';
import { LaunchPage } from '@/pages/launch';
import { PretestPage } from '@/pages/pretest';
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
  [BizPageRouter.PretestPage]: {
    path: '/pretest',
    component: () => PageSFC(PretestPage)
  },
  [BizPageRouter.TestHomePage]: {
    path: '/',
    component: () => PageSFC(HomePage)
  }
}