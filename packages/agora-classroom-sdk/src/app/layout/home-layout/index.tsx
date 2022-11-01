import { useLangSwitchValue } from '@/app/hooks/useLangSwitchValue';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren } from 'react';
import { getI18n } from 'react-i18next';
import './index.css';
import textImgEn from '@/app/assets/fcr-welcome-left-text-en.png';
import textImgZh from '@/app/assets/fcr-welcome-left-text-zh.png';

export const HomeLayout: FC<PropsWithChildren<unknown>> = observer(({ children }) => {
  const i18n = getI18n();

  const slogan = useLangSwitchValue({
    en: <img className="text-img en" src={textImgEn} />,
    zh: <img className="text-img zh" src={textImgZh} />,
  });

  return (
    <div className="w-full h-full overflow-auto">
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
  );
});
