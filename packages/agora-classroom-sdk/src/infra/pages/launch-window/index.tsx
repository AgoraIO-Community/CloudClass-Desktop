import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';
import { AgoraEduSDK, LanguageEnum, WindowID } from '../../api';

declare global {
  interface Window {
    __launchWindowID: string;
    __launchLanguage: string;
    __launchArgs: any;
  }
}

export const LaunchWindow = observer(() => {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const destroy = AgoraEduSDK.launchWindow(domRef.current!, {
      windowID: window.__launchWindowID as unknown as WindowID,
      language: window.__launchLanguage as unknown as LanguageEnum,
      args: window.__launchArgs,
    });

    return destroy;
  }, []);

  return <div ref={domRef} id="app" style={{ width: '100%', height: '100%' }} />;
});
