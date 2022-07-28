import { useCallback, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AboutMenu } from './about';
import { CloseAccount } from './close-account';
import { GeneralMenu } from './general';
import './index.css';
import { LanguageMenu } from './language';
import { RegionMenu } from './region';
import { SettingsMenu } from './settings';
import { ThemeMenu } from './theme';

export enum SettingsMenuEnum {
  Settings = 'settings',
  About = 'about',
  General = 'general',
  Language = 'language',
  Region = 'region',
  Theme = 'theme',
  CloseAccount = 'close-account',
}

export const HomeSettingContainerH5 = () => {
  const [menuPopups, setMenuPopups] = useState<SettingsMenuEnum[]>([]);
  const addMenuPopup = useCallback((menu: SettingsMenuEnum) => {
    setMenuPopups((prev) => [...prev, menu]);
  }, []);

  const removeMenuPopup = useCallback((menu: SettingsMenuEnum) => {
    setMenuPopups((prev) => prev.filter((m) => m !== menu));
  }, []);

  const menuMap = {
    [SettingsMenuEnum.Settings]: (
      <SettingsMenu addMenuPopup={addMenuPopup} removeMenuPopup={removeMenuPopup} />
    ),
    [SettingsMenuEnum.General]: (
      <GeneralMenu addMenuPopup={addMenuPopup} removeMenuPopup={removeMenuPopup} />
    ),
    [SettingsMenuEnum.Language]: <LanguageMenu removeMenuPopup={removeMenuPopup} />,
    [SettingsMenuEnum.Region]: <RegionMenu removeMenuPopup={removeMenuPopup} />,
    [SettingsMenuEnum.Theme]: <ThemeMenu removeMenuPopup={removeMenuPopup} />,
    [SettingsMenuEnum.About]: (
      <AboutMenu addMenuPopup={addMenuPopup} removeMenuPopup={removeMenuPopup} />
    ),
    [SettingsMenuEnum.CloseAccount]: <CloseAccount removeMenuPopup={removeMenuPopup} />,
  };

  return (
    <>
      <div
        className="setting-h5-btn inline-block p-0.5 z-50 absolute right-3 top-3"
        onClick={() => {
          addMenuPopup(SettingsMenuEnum.Settings);
        }}></div>
      <TransitionGroup>
        {menuPopups
          .filter((v) => menuMap[v])
          .map((v) => {
            return (
              <CSSTransition
                key={v}
                className="absolute top-0 w-screen h-screen page-animation"
                timeout={250}
                unmountOnExit={true}>
                <div>
                  <div className="flex justify-center items-center w-screen h-screen h5-page-container">
                    {menuMap[v]}
                  </div>
                </div>
              </CSSTransition>
            );
          })}
      </TransitionGroup>
    </>
  );
};
