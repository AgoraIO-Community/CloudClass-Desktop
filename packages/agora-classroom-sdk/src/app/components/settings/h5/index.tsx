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

export const useSettingsH5 = () => {
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

  const SettingsContainer = () => {
    return (
      <TransitionGroup>
        {menuPopups
          .filter((v) => menuMap[v])
          .map((v) => {
            return (
              <CSSTransition
                key={v}
                className="setting-h5-css-transition h5-setting-animation"
                timeout={250}
                unmountOnExit={true}>
                <div>
                  <div className="flex justify-center items-center w-screen h-screen setting-h5-menu-container">
                    {menuMap[v]}
                  </div>
                </div>
              </CSSTransition>
            );
          })}
      </TransitionGroup>
    );
  };

  const openSettings = useCallback(() => {
    addMenuPopup(SettingsMenuEnum.Settings);
  }, []);

  return { openSettings, SettingsContainer };
};
