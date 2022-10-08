import { GlobalStoreContext } from '@/app/stores';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useContext } from 'react';
import { ASpin, useI18n } from '~ui-kit';
import './index.css';

export const BasicLayout: FC<PropsWithChildren<unknown>> = observer(({ children }) => {
  const transI18n = useI18n();
  const globalStore = useContext(GlobalStoreContext);

  return (
    <ASpin
      tip={transI18n('fcr_loading')}
      spinning={globalStore.loading}
      size={'large'}
      className="global-loading-container">
      <div className="h-screen w-screen">{children}</div>
    </ASpin>
  );
});
