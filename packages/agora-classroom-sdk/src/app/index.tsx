import ReactDOM from 'react-dom';
import './index.css';
import { RouteContainer } from './router';
import { StoreProvider } from './stores';
import { token } from './utils';
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
  }
}

token.update(window.location.search);

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <RouteContainer />
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
