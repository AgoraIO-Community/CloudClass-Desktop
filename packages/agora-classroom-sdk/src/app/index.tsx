import { HomeStore } from '@/app/stores/home';
import { GlobalStorage } from '@/infra/utils';
import { Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { RouteContainer } from './router';
import { init } from './utils';
declare global {
  interface Window {
    __launchRegion: string;
    __launchLanguage: string;
    __launchRoomName: string;
    __launchUserName: string;
    __launchRoleType: string;
    __launchRoomType: string;
    __launchCompanyId: string;
    __launchProjectId: string;
    __accessToken: string;
    __refreshToken: string;
  }
}

init();

export const App: React.FC = () => {
  GlobalStorage.useLocalStorage();

  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
