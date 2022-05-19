import { useHomeStore } from '@/infra/hooks';
import { IAgoraExtensionApp } from 'agora-edu-core';
import { AgoraCountdown, AgoraPolling, AgoraSelector } from 'agora-plugin-gallery';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AgoraEduSDK, AgoraEduClassroomEvent } from '../../api';
import courseWareList from './courseware-list';

declare const CLASSROOM_SDK_VERSION: string;

export const LaunchPage = observer(() => {
  const homeStore = useHomeStore();

  const history = useHistory();

  const launchOption = homeStore.launchOption || {};

  useEffect(() => {
    if (!launchOption || isEmpty(launchOption)) {
      history.push('/');
      return;
    }
  }, []);

  const mountLaunch = useCallback(async (dom: HTMLDivElement) => {
    if (dom) {
      AgoraEduSDK.setParameters(
        JSON.stringify({
          host: homeStore.launchOption.sdkDomain,
        }),
      );

      AgoraEduSDK.config({
        appId: launchOption.appId,
        region: launchOption.region ?? 'CN',
      });

      launchOption.extensions = [
        new AgoraCountdown(),
        new AgoraSelector(),
        new AgoraPolling(),
      ] as IAgoraExtensionApp[];

      const recordUrl = `https://solutions-apaas.agora.io/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;

      await AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
        recordUrl,
        courseWareList,
        listener: (evt: AgoraEduClassroomEvent, type) => {
          console.log('launch#listener ', evt);
          if (evt === AgoraEduClassroomEvent.Destroyed) {
            history.push(`/?reason=${type}`);
          }
        },
        videoDirection: 'left',
      });
    }
  }, []);

  return (
    <div
      ref={mountLaunch}
      id="app"
      style={{ width: '100%', height: '100%', background: '#F9F9FC' }}></div>
  );
});
