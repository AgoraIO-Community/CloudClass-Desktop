import React, { FC, PropsWithChildren } from 'react';
import { useH5AndPcRedirect } from '../hooks/useH5AndPCRedirect';
import { AuthLayout } from '../layout/auth-layout';
import { AuthTokenPage } from '../pages/auth-token';
import { CreateRoom } from '../pages/create-room';
import { H5Invite } from '../pages/h5-invite';
import { H5JoinRoom } from '../pages/h5-join-room';
import { HomePage } from '../pages/home';
import { HomeH5Page } from '../pages/home/h5';
import { VocationalHomePage } from '../pages/home/vocational';
import { VocationalHomeH5Page } from '../pages/home/vocational-h5';
import { JoinRoom } from '../pages/join-room';
import { LaunchPage } from '../pages/launch';
import { LaunchWindow } from '../pages/launch-window';
import { LoginPage } from '../pages/login';
import { RecordationSearchPage } from '../pages/recordation-search';
import { Welcome } from '../pages/welcome';
import { HomeRouteContainer } from './home';
import { PageRouter } from './type';

export type AppRouteComponent = {
  path: string;
  component: React.FC;
  exact?: boolean;
};

const PageSFC = (Component: React.FC) => {
  return <Component />;
};

export const BrowserCheck: FC<PropsWithChildren<unknown>> = ({ children }) => {
  useH5AndPcRedirect();
  return <>{children}</>;
};

export const routesMap: Record<string, AppRouteComponent> = {
  [PageRouter.Home]: {
    path: '/',
    component: () => (
      <AuthLayout>
        <BrowserCheck>
          <HomeRouteContainer />
        </BrowserCheck>
      </AuthLayout>
    ),
    exact: false,
  },
  [PageRouter.Welcome]: {
    path: '/',
    component: Welcome,
    exact: true,
  },
  [PageRouter.CreateRoom]: {
    path: '/create-room',
    component: CreateRoom,
    exact: true,
  },
  [PageRouter.JoinRoom]: {
    path: '/join-room',
    component: JoinRoom,
    exact: true,
  },
  [PageRouter.Invite]: {
    path: '/invite',
    component: JoinRoom,
    exact: true,
  },
  [PageRouter.Launch]: {
    path: '/launch',
    component: () => PageSFC(LaunchPage),
    exact: true,
  },
  [PageRouter.H5Welcome]: {
    path: '/h5',
    component: () => (
      <BrowserCheck>
        <H5JoinRoom></H5JoinRoom>
      </BrowserCheck>
    ),
    exact: true,
  },
  [PageRouter.H5JoinRoom]: {
    path: '/h5/join-room',
    component: () => (
      <BrowserCheck>
        <H5JoinRoom></H5JoinRoom>
      </BrowserCheck>
    ),
    exact: true,
  },
  [PageRouter.H5Invite]: {
    path: '/h5/invite',
    component: () => (
      <BrowserCheck>
        <H5Invite></H5Invite>
      </BrowserCheck>
    ),
    exact: true,
  },
  [PageRouter.FlexHome]: {
    path: '/flex',
    component: () => <AuthLayout>{PageSFC(HomePage)}</AuthLayout>,
    exact: true,
  },
  [PageRouter.LoginPage]: {
    path: '/login',
    component: () => PageSFC(LoginPage),
    exact: true,
  },
  [PageRouter.AuthTokenPage]: {
    path: '/auth-token',
    component: () => PageSFC(AuthTokenPage),
    exact: true,
  },
  [PageRouter.ShareLinkPage]: {
    path: '/share',
    component: () => PageSFC(HomePage),
    exact: true,
  },
  [PageRouter.FlexH5Home]: {
    path: '/flex/h5login',
    component: () => <HomeH5Page />,
    exact: true,
  },
  [PageRouter.VocationalHome]: {
    path: '/vocational',
    component: () => (
      <AuthLayout>
        <VocationalHomePage />
      </AuthLayout>
    ),
    exact: true,
  },
  [PageRouter.VocationalHomeH5Home]: {
    path: '/vocational/h5login',
    component: () => (
      <AuthLayout>
        <VocationalHomeH5Page />
      </AuthLayout>
    ),
    exact: true,
  },
  [PageRouter.RecordationSearchPage]: {
    path: '/recordation-search/:p',
    component: () => PageSFC(RecordationSearchPage),
    exact: true,
  },
  [PageRouter.Window]: {
    path: '/window',
    component: () => PageSFC(LaunchWindow),
    exact: true,
  },
};
