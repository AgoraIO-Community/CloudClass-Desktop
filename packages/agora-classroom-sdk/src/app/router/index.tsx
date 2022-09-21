import { Route, Switch } from 'react-router';
import { routesMap } from './maps';
import { PageRouter } from './type';

const routes: PageRouter[] = [
  PageRouter.LoginPage,
  PageRouter.AuthTokenPage,
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
  PageRouter.H5Welcome,
  PageRouter.H5JoinRoom,
  PageRouter.H5Invite,
  PageRouter.Home,
];

export const RouteContainer = () => {
  return (
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
  );
};
