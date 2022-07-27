import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { routesMap } from '@/app/router';
import { HomeStore } from '@/app/stores/home';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import { BizPageRouter } from './router/type';
import { GlobalStorage } from '@/infra/utils';

declare const EDU_CATEGORY: string;

const routes: BizPageRouter[] = [
  BizPageRouter.PretestPage,
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.MidClass,
  BizPageRouter.BigClass,
  BizPageRouter.LaunchPage,
];

const redirect =
  AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron &&
  EDU_CATEGORY === 'vocational';

const RouteContainer = () => {
  return (
    <HashRouter>
      <Switch>
        {redirect ? <Redirect exact from="/" to="/vocational" /> : null}
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
};

export const App = () => {
  GlobalStorage.useLocalStorage();
  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
