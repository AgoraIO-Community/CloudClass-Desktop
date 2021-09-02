import { useHomeStore } from '@/infra/hooks';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { AgoraChatWidget, AgoraHXChatWidget } from 'agora-widget-gallery';
//@ts-ignore
import { AgoraExtAppCountDown } from 'agora-plugin-gallery';
import MD5 from 'js-md5';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { AgoraEduEvent, AgoraEduSDK } from '../../api';
import { ClassRoom, ClassRoomAbstractStore } from '../../api/controller';
import { transI18n } from '~ui-kit';

const ChatWidgetFactory = (region: string) => {
  if (region.toUpperCase() === 'CN') {
    return new AgoraHXChatWidget();
  }
  return new AgoraChatWidget();
};

export const LaunchPage = observer(() => {
  const homeStore = useHomeStore();

  const history = useHistory();

  const launchOption = homeStore.launchOption || {};

  const roomRef = useRef<ClassRoom<ClassRoomAbstractStore> | null>(null);

  useEffect(() => {
    if (!launchOption || isEmpty(launchOption)) {
      history.push('/');
      return;
    }
  }, []);

  const mountLaunch = useCallback(
    async (dom: any) => {
      if (dom) {
        // TODO: guarantee using default sdkDomain in production SDK_DOMAIN
        if (`${REACT_APP_AGORA_APP_SDK_DOMAIN}`.match('api.agora.io')) {
          AgoraEduSDK.setParameters(
            JSON.stringify({
              reportUrl: `${REACT_APP_REPORT_URL}`,
              reportQos: `${REACT_APP_REPORT_QOS}`,
              reportV1Url: `${REACT_APP_V1_REPORT_URL}`,
            }),
          );
        } else {
          // TODO: guarantee test env using customize sdkDomain
          AgoraEduSDK.setParameters(
            JSON.stringify({
              'edu.apiUrl': `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
              reportUrl: `${REACT_APP_REPORT_URL}`,
              reportQos: `${REACT_APP_REPORT_QOS}`,
              reportV1Url: `${REACT_APP_V1_REPORT_URL}`,
            }),
          );
        }
        AgoraEduSDK.config({
          appId: launchOption.appId ?? `${REACT_APP_AGORA_APP_ID}`,
          region: launchOption.region ?? 'CN',
        });
        // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
        // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
        // const appCertificate = `${REACT_APP_AGORA_APP_CERTIFICATE}`;
        // if (appCertificate) {
        //   launchOption.rtmToken = RtmTokenBuilder.buildToken(
        //     `${REACT_APP_AGORA_APP_ID}`,
        //     appCertificate,
        //     launchOption.userUuid,
        //     RtmRole.Rtm_User,
        //     0,
        //   );
        // }

        launchOption.extApps = [new AgoraExtAppCountDown(launchOption.language as any)];
        const genH5Scenes = (size: number) => {
          return new Array(size).fill(1).map((_, index) => ({ name: `${index + 1}` }));
        };

        const size = 14;

        roomRef.current = await AgoraEduSDK.launch(dom, {
          ...launchOption,
          // boardOptions: {
          //   userPayload: {
          //     cursorName: ""
          //   }
          // },
          // TODO:  这里需要传递开发者自己发布的录制页面地址
          recordUrl: AGORA_APAAS_BRANCH_PATH
            ? `https://webdemo.agora.io/flexible-classroom/${AGORA_APAAS_BRANCH_PATH}/record_page`
            : `https://webdemo.agora.io/flexible-classroom/record_page`,
          courseWareList: [
            {
              resourceName: transI18n('whiteboard.h5-courseWare'),
              resourceUuid: `h5${MD5('https://demo-h5.netless.group/dist2020/')}`,
              ext: 'h5',
              url: 'https://demo-h5.netless.group/dist2020/',
              conversion: {
                type: 'static',
              },
              size: 0,
              updateTime: 0,
              scenes: genH5Scenes(size),
              convert: false,
              taskUuid: '',
              taskToken: '',
              taskProgress: {
                totalPageSize: size,
                convertedPageSize: 0,
                convertedPercentage: 100,
                convertedFileList: [],
              },
            },
            {
              isActive: true,
              resourceName: transI18n('whiteboard.test-courseWare'),
              resourceUuid: `h5${MD5(
                'https://agora-apaas.oss-accelerate.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/mjwrihugyrew4/06546e948fe67f6bf7b161cf5afa4103',
              )}1`,
              ext: 'pptx',
              url: 'https://agora-apaas.oss-accelerate.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/mjwrihugyrew4/06546e948fe67f6bf7b161cf5afa4103',
              conversion: {
                type: 'static',
              },
              size: 0,
              updateTime: 1623743516439,
              scenes: [
                {
                  name: '1',
                  ppt: {
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/1.slide',
                    width: 1280,
                    height: 720,
                  },
                },
                {
                  name: '2',
                  ppt: {
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/2.slide',
                    width: 1280,
                    height: 720,
                  },
                },
                {
                  name: '3',
                  ppt: {
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/3.slide',
                    width: 1280,
                    height: 720,
                  },
                },
              ],
              convert: false,
              taskUuid: '3361daf0d28011ebae6f1dc0589306eb',
              taskToken: '',
              taskProgress: {
                totalPageSize: 3,
                convertedPageSize: 3,
                convertedPercentage: 100,
                convertedFileList: [],
              },
            },
          ],
          // recordUrl: `${REACT_APP_AGORA_APP_RECORD_URL}`,
          listener: (evt: AgoraEduEvent) => {
            console.log('launch#listener ', evt);
            if (evt === AgoraEduEvent.destroyed) {
              history.push('/');
            }
          },
        });
      }
      return () => {
        if (roomRef.current) {
          roomRef.current.destroy();
        }
      };
    },
    [AgoraEduSDK],
  );

  return (
    <div
      ref={mountLaunch}
      id="app"
      style={{ width: '100%', height: '100%', background: '#F9F9FC' }}></div>
  );
});
