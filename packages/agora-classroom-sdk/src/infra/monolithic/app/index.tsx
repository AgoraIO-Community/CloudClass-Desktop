import { GenAppContainer } from '@/infra/containers/app-container';
import { BizPageRouter } from '@/infra/types';
import { AppStoreConfigParams } from 'agora-edu-core';
import { RoomParameters } from '../../api/declare';

const routes: BizPageRouter[] = [
  BizPageRouter.LaunchPage,
  BizPageRouter.TestRecordPage,
  BizPageRouter.TestHomePage,
];

type AppType = {
  appConfig: AppStoreConfigParams;
  roomConfig?: RoomParameters;
  basename?: string;
};

export const App = (props: AppType) => {
  const AppContainer = GenAppContainer({
    appConfig: props.appConfig,
    roomConfig: props.roomConfig,
    globalId: 'demo',
    basename: props.basename,
    resetRoomInfo: true,
  });

  return <AppContainer routes={routes} />;
};
