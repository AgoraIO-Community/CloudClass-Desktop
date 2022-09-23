import { useHomeStore } from '@/app/hooks';
import { useElementWithI18n } from '@/app/hooks/useComWithI18n';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren } from 'react';
import { getI18n } from 'react-i18next';
import { ASpin, useI18n } from '~ui-kit';
import './index.css';

export const HomeLayout: FC<PropsWithChildren<unknown>> = observer(({ children }) => {
  const transI18n = useI18n();
  const homeStore = useHomeStore();
  const i18n = getI18n();

  const slogan = useElementWithI18n({
    en: (
      <div className="text">
        BUILD
        <br />
        ONLINE CLASSROOM
        <br />
        IN MINUTES
      </div>
    ),
    zh: (
      <div className="text">
        轻松创建
        <br /> 线上专属课堂
      </div>
    ),
  });

  return (
    <ASpin
      tip={transI18n('fcr_loading')}
      spinning={homeStore.loading}
      size={'large'}
      className="home-loading-container">
      <div className="page-container">
        <div className={`home`}>
          <div className="home-left">
            <header className="flex items-center">
              <div className={`logo ${i18n.language}`}></div>
              {/* <div>Product</div> */}
            </header>
            {slogan}
          </div>
          <div className="home-right flex-1">{children}</div>
        </div>
      </div>
    </ASpin>
  );
});
