import { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { AuthLayout } from '../layout/auth-layout';
import { BasicLayout } from '../layout/basic-layout';
import { BrowserCheckLayout } from '../layout/browser-check-layout';
import { routesMap } from './maps';
import { PageRouter } from './type';

const routes: PageRouter[] = [
  PageRouter.Logout,
  PageRouter.PretestPage,
  PageRouter.Setting,
  PageRouter.OneToOne,
  PageRouter.MidClass,
  PageRouter.BigClass,
  PageRouter.Launch,
  PageRouter.RecordationSearchPage,
  PageRouter.Window,
  PageRouter.ShareLinkPage,
  PageRouter.FlexH5Home,
  PageRouter.FlexHome,
  PageRouter.VocationalHome,
  PageRouter.VocationalHomeH5Home,
  PageRouter.H5Index,
  PageRouter.H5JoinRoom,
  PageRouter.H5Invite,
  PageRouter.Index,
];

export const RouteContainer = () => {
  const browserCheckIncludes = useMemo(() => {
    const list = [
      PageRouter.Index,
      PageRouter.Welcome,
      PageRouter.JoinRoom,
      PageRouter.CreateRoom,
      PageRouter.Invite,
      PageRouter.H5Index,
      PageRouter.H5JoinRoom,
      PageRouter.H5Invite,
    ];
    return list.map((v) => routesMap[v].path);
  }, []);

  const authIncludes = useMemo(() => {
    const list = [PageRouter.JoinRoom, PageRouter.Invite, PageRouter.CreateRoom];
    return list.map((v) => routesMap[v].path);
  }, []);

  return (
    <HashRouter>
      <BasicLayout>
        <AuthLayout includes={authIncludes}>
          <BrowserCheckLayout includes={browserCheckIncludes}>
            <Switch>
              {routes.map((item, index) => {
                const route = routesMap[item];
                if (!route) return null;
                return (
                  <Route
                    key={item + index}
                    exact={!!route.exact}
                    path={route.path}
                    component={route.component}
                  />
                );
              })}
            </Switch>
          </BrowserCheckLayout>
        </AuthLayout>
      </BasicLayout>
    </HashRouter>
  );
};
