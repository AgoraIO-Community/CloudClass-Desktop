import { AgoraEduSDK, LanguageEnum, WindowID } from '@/infra/api';
import { useHomeStore } from '@/infra/hooks';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { EduRoomTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    __launchWindowID: string;
    __launchLanguage: string;
    __launchArgs: any;
    __launchRoomType: string;
    __launchUIMode: string;
  }
}

export const LaunchWindow = observer(() => {
  const domRef = useRef<HTMLDivElement>(null);
  const { theme } = useHomeStore();

  useEffect(() => {
    const destroy = AgoraEduSDK.launchWindow(domRef.current!, {
      windowID: window.__launchWindowID as unknown as WindowID,
      language: window.__launchLanguage as unknown as LanguageEnum,
      args: window.__launchArgs,
      roomType:
        (parseInt(window.__launchRoomType) as EduRoomTypeEnum) || EduRoomTypeEnum.Room1v1Class,
      uiMode: (window.__launchUIMode as FcrMultiThemeMode) || theme,
    });

    return destroy;
  }, []);

  return <div ref={domRef} id="app" style={{ width: '100%', height: '100%' }} />;
});
