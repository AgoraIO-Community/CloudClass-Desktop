import { useHomeStore } from '@/infra/hooks';
import { AgoraExtAppCountDown, AgoraExtAppAnswer, AgoraExtAppVote } from 'agora-plugin-gallery';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AgoraEduSDK, AgoraEduClassroomEvent } from '../../api';

declare const CLASSROOM_SDK_VERSION: string;

const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

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
        appId: launchOption.appId ?? REACT_APP_AGORA_APP_ID,
        region: launchOption.region ?? 'CN',
      });

      // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
      // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
      const appId = REACT_APP_AGORA_APP_ID;
      const appCertificate = REACT_APP_AGORA_APP_CERTIFICATE;
      if (appId && appCertificate) {
        launchOption.rtmToken = RtmTokenBuilder.buildToken(
          appId,
          appCertificate,
          launchOption.userUuid,
          RtmRole.Rtm_User,
          0,
        );
      }

      launchOption.extApps = [
        new AgoraExtAppCountDown(launchOption.language),
        new AgoraExtAppAnswer(launchOption.language),
        new AgoraExtAppVote(launchOption.language),
      ];
      const recordUrl = `https://agora-adc-artifacts.s3.cn-north-1.amazonaws.com.cn/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;

      await AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
        recordUrl,
        courseWareList: [],
        listener: (evt: AgoraEduClassroomEvent, type) => {
          console.log('launch#listener ', evt);
          if (evt === AgoraEduClassroomEvent.Destroyed) {
            history.push(`/?reason=${type}`);
          }
        },
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
