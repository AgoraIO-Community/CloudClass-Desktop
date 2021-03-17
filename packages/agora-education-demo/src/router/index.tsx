import { OneToOne } from '@/pages/one-to-one';
import { SettingPage } from '@/pages/setting';
import { HomePage } from '@/pages/home';
import { LaunchPage } from '@/pages/launch';
import { PretestPage } from '@/pages/pretest';
import React from 'react';
import { BizPageRouter } from '@/types';

export type AppRouteComponent = {
  path: string
  component: React.FC<any>
}

// TODO: need fix tsx
const PageSFC = (Component: React.FC<any>) => {
  return <Component />
}
export const routesMap: Record<string, AppRouteComponent> = {
  [BizPageRouter.Setting]: {
    path: '/setting',
    component: () => PageSFC(SettingPage)
  },
  [BizPageRouter.OneToOne]: {
    path: '/classroom/one-to-one',
    component: () => PageSFC(OneToOne)
  },
  [BizPageRouter.OneToOneIncognito]: {
    path: '/classroom/one-to-one/incognito',
    component: () => PageSFC(OneToOne)
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