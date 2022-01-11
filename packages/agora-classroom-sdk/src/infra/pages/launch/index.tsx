import { useHomeStore } from '@/infra/hooks';
import { AgoraExtAppCountDown, AgoraExtAppAnswer, AgoraExtAppVote } from 'agora-plugin-gallery';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AgoraEduSDK, AgoraEduClassroomEvent } from '../../api';
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

      launchOption.extApps = [
        new AgoraExtAppCountDown(launchOption.language),
        new AgoraExtAppAnswer(launchOption.language),
        new AgoraExtAppVote(launchOption.language),
      ];

      const recordUrl = `https://solutions-apaas.agora.io/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;

      await AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
        recordUrl,
        courseWareList: [
          {
            resourceUuid: '9196d03d87ab1e56933f911eafe760c3',
            resourceName: 'AgoraFlexibleClassroomE.pptx',
            ext: 'pptx',
            size: 10914841,
            url: 'https://agora-adc-artifacts.oss-cn-beijing.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/jasoncai4/9196d03d87ab1e56933f911eafe760c3.pptx',
            updateTime: 1641805816941,
            taskUuid: '203197d071f511ecb84859b705e54fae',
            conversion: {
              type: 'dynamic',
              preview: true,
              scale: 2,
              outputFormat: 'png',
            },
            taskProgress: {
              status: 'Finished',
              totalPageSize: 24,
              convertedPageSize: 24,
              convertedPercentage: 100,
              currentStep: 'Packaging',
              convertedFileList: [
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/1.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/1.slide',
                  },
                  name: '1',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/2.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/2.slide',
                  },
                  name: '2',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/3.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/3.slide',
                  },
                  name: '3',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/4.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/4.slide',
                  },
                  name: '4',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/5.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/5.slide',
                  },
                  name: '5',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/6.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/6.slide',
                  },
                  name: '6',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/7.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/7.slide',
                  },
                  name: '7',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/8.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/8.slide',
                  },
                  name: '8',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/9.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/9.slide',
                  },
                  name: '9',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/10.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/10.slide',
                  },
                  name: '10',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/11.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/11.slide',
                  },
                  name: '11',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/12.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/12.slide',
                  },
                  name: '12',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/13.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/13.slide',
                  },
                  name: '13',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/14.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/14.slide',
                  },
                  name: '14',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/15.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/15.slide',
                  },
                  name: '15',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/16.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/16.slide',
                  },
                  name: '16',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/17.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/17.slide',
                  },
                  name: '17',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/18.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/18.slide',
                  },
                  name: '18',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/19.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/19.slide',
                  },
                  name: '19',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/20.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/20.slide',
                  },
                  name: '20',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/21.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/21.slide',
                  },
                  name: '21',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/22.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/22.slide',
                  },
                  name: '22',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/23.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/23.slide',
                  },
                  name: '23',
                },
                {
                  ppt: {
                    width: 1280,
                    height: 720,
                    preview:
                      'https://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/preview/24.png',
                    src: 'pptx://convertcdn.netless.link/dynamicConvert/203197d071f511ecb84859b705e54fae/24.slide',
                  },
                  name: '24',
                },
              ],
            },
          },
        ],
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
