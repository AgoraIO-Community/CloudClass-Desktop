import { RoomContainer } from '@/infra/containers/app-container';
import { useGlobalContext } from 'agora-edu-core';
import { BizPageRouter } from '@/infra/types';
import { observer } from 'mobx-react';
import { AgoraCSSBasement } from '~ui-kit';
import { ToastContainer } from '~capabilities/containers/toast';
import './index.css';

const routes: BizPageRouter[] = [
  BizPageRouter.PretestPage,
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.MidClass,
  BizPageRouter.BigClass,
];

export const LiveRoom = observer(() => {
  const { mainPath, language, params } = useGlobalContext();

  return (
    <>
      <AgoraCSSBasement />
      <RoomContainer mainPath={mainPath!} routes={routes} language={language} params={params} />
      <ToastContainer />
    </>
  );
});
