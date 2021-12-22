import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { routesMap } from '@/infra/router';
import { HomeStore } from '@/infra/stores/home';
import { BizPageRouter } from './infra/types';
import { GlobalStorage } from './infra/utils';

const routes: BizPageRouter[] = [
  BizPageRouter.PretestPage,
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.MidClass,
  BizPageRouter.BigClass,
  BizPageRouter.LaunchPage,
];

const RouteContainer = () => (
  <HashRouter>
    <Switch>
      {routes.map((item, index) => {
        const route = routesMap[item];
        if (!route) return null;
        return <Route key={index} exact path={route.path} component={route.component} />;
      })}
      <Route
        key={'default'}
        path={'/'}
        component={routesMap[BizPageRouter.TestHomePage].component}
      />
    </Switch>
  </HashRouter>
);

export const App = () => {
  GlobalStorage.useLocalStorage();
  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
