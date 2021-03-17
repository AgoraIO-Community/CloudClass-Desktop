import { OneToOne } from '@/pages/one-to-one';
import { Setting } from '@/pages/setting';
import { HomePage } from '@/pages/home';
import { Launch } from '@/pages/launch';
import { Pretest } from '@/pages/pretest';
import React from 'react';

export type AppRouteComponent = {
  path: string
  component: React.FC<any>
}

// TODO: need fix type
const PageSFC = (component: React.FC<any>) => React.cloneElement(component as unknown as React.ReactElement)

export const routesMap: Record<string, AppRouteComponent> = {
  'setting': {
    path: '/setting',
    component: () => PageSFC(Setting)
  },
  '1v1': {
    path: '/classroom/one-to-one',
    component: () => PageSFC(OneToOne)
  },
  '1v1_incognito': {
    path: '/classroom/one-to-one/incognito',
    component: () => PageSFC(OneToOne)
  },
  'launch': {
    path: '/launch',
    component: () => PageSFC(Launch)
  },
  'pretest': {
    path: '/pretest',
    component: () => PageSFC(Pretest)
  },
  'home': {
    path: '/',
    component: () => PageSFC(HomePage)
  }
}