import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { routesMap } from '@/infra/router';
import { HomeStore } from '@/infra/stores/home';
import { BizPageRouter } from './infra/types';
import { GlobalStorage } from './infra/utils';

const EDU_CATEGORY = process.env.EDU_CATEGORY || 'general';

const REDIRECT_MAPS: { [key: string]: string } = {
  general: '/',
  vocational: '/vocational',
};

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
      {REDIRECT_MAPS[EDU_CATEGORY] !== '/' && (
        <Redirect exact from="/" to={REDIRECT_MAPS[EDU_CATEGORY]} />
      )}

      {routes.map((item, index) => {
        const route = routesMap[item];
        if (!route) return null;
        return <Route key={index} exact path={route.path} component={route.component} />;
      })}
      <Route
        key={'default'}
        path={'/'}
        exact
        component={routesMap[BizPageRouter.TestHomePage].component}
      />
      <Route
        key={'h5login'}
        path={'/h5login'}
        component={routesMap[BizPageRouter.TestH5HomePage].component}
      />
      <Route
        key={'vocational'}
        path={'/vocational'}
        exact
        component={routesMap[BizPageRouter.VocationalHomePage].component}
      />
      <Route
        key={'vocational-h5login'}
        path={'/vocational/h5login'}
        component={routesMap[BizPageRouter.VocationalHomeH5Page].component}
      />
      <Route
        key={'recordation'}
        path={'/recordation-search/:p'}
        component={routesMap[BizPageRouter.RecordationSearchPage].component}
      />
      <Route
        key={'window'}
        path={'/window'}
        component={routesMap[BizPageRouter.Window].component}
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
