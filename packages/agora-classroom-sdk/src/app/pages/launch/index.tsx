import { GlobalStoreContext } from '@/app/stores';
import { AgoraEduSDK } from '@/infra/api';
import { AgoraEduClassroomEvent } from 'agora-edu-core';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import courseWareList from './courseware-list';
import ReactDOM from 'react-dom';
export const LaunchPage = observer(() => {
  const homeStore = useContext(GlobalStoreContext);
  const appRef = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const launchOption = homeStore.launchOption;

  useEffect(() => {
    if (isEmpty(launchOption)) {
      history.push('/');
      return;
    }
  }, []);

  useEffect(() => {
    if (appRef.current) {
      const dom = appRef.current;
      mountLaunch(dom);
      return () => {
        ReactDOM.unmountComponentAtNode(dom);
      };
    }
  }, []);

  const mountLaunch = useCallback(async (dom: HTMLDivElement) => {
    if (dom) {
      AgoraEduSDK.setParameters(
        JSON.stringify({
          host: homeStore.launchOption.sdkDomain,
          uiConfigs: homeStore.launchOption.scenes,
          themes: homeStore.launchOption.themes,
        }),
      );

      AgoraEduSDK.config({
        appId: launchOption.appId,
        region: launchOption.region ?? 'CN',
      });

      // const recordUrl = `https://solutions-apaas.agora.io/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;
      const recordUrl = `https://agora-adc-artifacts.s3.cn-north-1.amazonaws.com.cn/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;

      AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
        recordUrl,
        courseWareList,
        uiMode: homeStore.theme,
        listener: (evt: AgoraEduClassroomEvent, type) => {
          console.log('launch#listener ', evt);
          if (evt === AgoraEduClassroomEvent.Destroyed) {
            history.push(`/?reason=${type}`);
          }
        },
      });
    }
  }, []);

  return <div ref={appRef} id="app" className="bg-background w-full h-full"></div>;
});
