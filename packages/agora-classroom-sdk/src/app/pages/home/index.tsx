import { Layout, Toast, transI18n, useI18n } from '~ui-kit';
import './style.css';
import { addResource } from '../../components/i18n';
import { FC, useEffect, useState, Fragment, useRef } from 'react';
import { useHomeStore } from '@/infra/hooks';
import { EduRegion, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import { getBrowserLanguage, storage } from '@/infra/utils';
import md5 from 'js-md5';
import { useHistory } from 'react-router';
import { HomeApi } from './home-api';
import { HomeLaunchOption } from '@/app/stores/home';
import { AgoraEduSDK, LanguageEnum } from '@/infra/api';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';
import { observer } from 'mobx-react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { ToastType } from '@/infra/stores/common/share-ui';
import { MessageDialog } from './message-dialog';
import { HomeSettingContainer } from './home-setting';
import { LoginForm } from './login-form';
addResource();

const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;
const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

declare global {
  interface Window {
    __launchRegion: string;
    __launchLanguage: string;
    __launchRoomName: string;
    __launchUserName: string;
    __launchRoleType: string;
    __launchRoomType: string;
    __launchCompanyId: string;
    __launchProjectId: string;
  }
}

const regionByLang = {
  zh: EduRegion.CN,
  en: EduRegion.NA,
};



const useBuilderConfig = () => {
  const builderResource = useRef({
    scenes: {},
    themes: {}
  });
  const t = useI18n();

  const defaultScenes = [{ text: t('home.roomType_1v1'), value: `${EduRoomTypeEnum.Room1v1Class}` },
  { text: t('home.roomType_interactiveSmallClass'), value: `${EduRoomTypeEnum.RoomSmallClass}` },
  { text: t('home.roomType_interactiveBigClass'), value: `${EduRoomTypeEnum.RoomBigClass}` }];

  const [roomTypes, setRoomTypes] = useState<EduRoomTypeEnum[]>([]);

  const sceneOptions = defaultScenes.filter(({ value }) => {
    return roomTypes.some((t) => `${t}` === value);
  });

  useEffect(() => {
    const companyId = window.__launchCompanyId;
    const projectId = window.__launchProjectId;

    if (companyId && projectId) {
      HomeApi.shared.setBuilderDomainRegion(EduRegion.CN);
      HomeApi.shared.getBuilderResource(companyId, projectId).then(({ scenes, themes }) => {
        builderResource.current = {
          scenes: scenes ?? {},
          themes: themes ? { default: themes } : {},
        };

        AgoraEduSDK.setParameters(
          JSON.stringify({
            uiConfigs: builderResource.current.scenes,
            themes: builderResource.current.themes,
          }),
        );

        setRoomTypes(AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType));
      });
    } else {
      setRoomTypes(AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType));
    }
  }, []);

  return {
    builderResource,
    sceneOptions: sceneOptions.length ? sceneOptions : defaultScenes
  };
}


export const HomePage = () => {
  const homeStore = useHomeStore();
  const history = useHistory();

  const launchConfig = homeStore.launchConfig;

  const [duration] = useState<string>(`${+launchConfig.duration / 60 || 30}`);

  const [loading, setLoading] = useState<boolean>(false);

  const t = useI18n();

  const { builderResource, sceneOptions } = useBuilderConfig();

  useEffect(() => {
    const language = window.__launchLanguage || homeStore.language || getBrowserLanguage();
    const region = window.__launchRegion || homeStore.region || regionByLang[getBrowserLanguage()];
    homeStore.setLanguage(language as LanguageEnum);
    homeStore.setRegion(region as EduRegion);


    if (history.location.pathname === '/share') {
      setTimeout(() => {
        handleSubmit({
          roleType: window.__launchRoleType,
          roomType: window.__launchRoomType,
          roomName: window.__launchRoomName,
          userName: `user_${''.padEnd(6, `${Math.floor(Math.random() * 10000)}`)}`,
        });
      });
    }
  }, []);

  const [courseWareList] = useState<any[]>(storage.getCourseWareSaveList());


  const handleSubmit = async ({
    roleType,
    roomType: rt,
    roomName,
    userName,
  }: {
    roleType: string;
    roomType: string;
    roomName: string;
    userName: string;
  }) => {
    if (loading) {
      return;
    }
    const language = homeStore.language || getBrowserLanguage();
    const region = homeStore.region || regionByLang[getBrowserLanguage()];

    const userRole = parseInt(roleType);

    const roomType = parseInt(rt);

    const userUuid = `${md5(userName)}${userRole}`;

    const roomUuid = `${md5(roomName)}${roomType}`;

    try {
      setLoading(true);

      const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;

      HomeApi.shared.setDomainRegion(region);

      const { token, appId } = await HomeApi.shared.loginV3(userUuid, roomUuid, userRole);

      const companyId = window.__launchCompanyId;
      const projectId = window.__launchProjectId;

      const shareUrl =
        AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron
          ? ''
          : `${location.origin}${location.pathname
          }?roomName=${roomName}&roomType=${roomType}&region=${region}&language=${language}&roleType=${EduRoleTypeEnum.student
          }&companyId=${companyId ?? ''}&projectId=${projectId ?? ''}#/share`;

      console.log('## get rtm Token from demo server', token);

      const config: HomeLaunchOption = {
        appId,
        sdkDomain: domain,
        pretest: true,
        courseWareList: courseWareList.slice(0, 1),
        language: language as LanguageEnum,
        userUuid: `${userUuid}`,
        rtmToken: token,
        roomUuid: `${roomUuid}`,
        roomType: roomType,
        roomName: `${roomName}`,
        userName: userName,
        roleType: userRole,
        region: region as EduRegion,
        duration: +duration * 60,
        latencyLevel: 2,
        scenes: builderResource.current.scenes,
        themes: builderResource.current.themes,
        shareUrl,
      };

      config.appId = REACT_APP_AGORA_APP_ID || config.appId;
      // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
      // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
      if (REACT_APP_AGORA_APP_CERTIFICATE) {
        config.rtmToken = RtmTokenBuilder.buildToken(
          config.appId,
          REACT_APP_AGORA_APP_CERTIFICATE,
          config.userUuid,
          RtmRole.Rtm_User,
          0,
        );

        console.log(`## build rtm Token ${config.rtmToken} by using RtmTokenBuilder`);
      }
      homeStore.setLaunchConfig(config);
      history.push('/launch');
    } catch (e) {
      homeStore.addToast({
        id: uuidv4(),
        desc:
          (e as Error).message === 'Network Error'
            ? transI18n('home.network_error')
            : (e as Error).message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <MessageDialog />
      <HomeToastContainer />
      <div className="app-home h-full">
        <nav className="absolute left-0 top-0 w-full text-white z-10" style={{ padding: 32 }}>
          <Layout className="justify-between items-end">
            <Layout className="nav-header flex items-center">
              <span className="product-logo" />
              <span className="product-name">{t('home_product_name')}</span>
            </Layout>
            <Layout>
              {/* <div className='mr-3'>
                                <Dropdown options={regionOptions} value={region} onChange={handleChangeRegion} />
                            </div>
                            <div className='mr-3'>
                                <Dropdown options={languageOptions} value={language} onChange={handleChangeLanguage} width={68} />
                            </div> */}
              <span className="about-btn cursor-pointer">
                <HomeSettingContainer />
              </span>
            </Layout>
          </Layout>
        </nav>
        <div
          className="form-section fixed animated-form"
          style={{
            top: 'min(max(calc( 50% - 270px ), 100px), 200px)',
            right: 40,
            padding: '36px 54px 26px',
          }}>
          <LoginForm onSubmit={handleSubmit} sceneOptions={sceneOptions} />
        </div>
      </div>
    </Fragment>
  );
};

const HomeToastContainer: FC = observer(() => {
  const { toastList, removeToast } = useHomeStore();
  return (
    <TransitionGroup style={{ justifyContent: 'center', display: 'flex' }}>
      {toastList.map((value: ToastType, idx: number) => (
        <CSSTransition classNames="toast-animation" timeout={1000} key={`${value.id}`}>
          <Toast
            style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
            type={value.type}
            closeToast={() => {
              removeToast(value.id);
            }}>
            {value.desc}
          </Toast>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
});
