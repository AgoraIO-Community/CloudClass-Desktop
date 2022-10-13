import { GlobalStorage } from '@/infra/utils';
import ReactDOM from 'react-dom';
import { RouteContainer } from './router';
import { StoreProvider } from './stores';
import { token } from './utils/token';
import './index.css';
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

export const App: React.FC = () => {
  GlobalStorage.useLocalStorage();
  token.init();
  return (
    <StoreProvider>
      <RouteContainer />
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
