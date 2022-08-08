import { routesMap } from '@/app/router';
import { HomeStore } from '@/app/stores/home';
import { GlobalStorage } from '@/infra/utils';
import { isVocationalElectron } from '@/infra/utils/env';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import { BizPageRouter } from './router/type';

const routes: BizPageRouter[] = [
  BizPageRouter.PretestPage,
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.MidClass,
  BizPageRouter.BigClass,
  BizPageRouter.LaunchPage,
  BizPageRouter.RecordationSearchPage,
  BizPageRouter.Window,
  BizPageRouter.TestHomePage,
  BizPageRouter.ShareLinkPage,
  BizPageRouter.TestH5HomePage,
  BizPageRouter.VocationalHomePage,
  BizPageRouter.VocationalHomeH5Page,
];

const RouteContainer = () => {
  return (
    <HashRouter>
      <Switch>
        {isVocationalElectron ? <Redirect exact from="/" to="/vocational" /> : null}
        {routes.map((item, index) => {
          const route = routesMap[item];
          if (!route) return null;
          return <Route key={index} exact path={route.path} component={route.component} />;
        })}
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
