import { GlobalStoreContext } from '@/app/stores';
import { GlobalLaunchOption } from '@/app/stores/global';
import { AgoraEduSDK, LanguageEnum } from '@/infra/api';
import { ToastType } from '@/infra/stores/common/share-ui';
import { getBrowserLanguage, storage } from '@/infra/utils';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { EduRegion, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { Button, Layout, SvgIconEnum, SvgImg, Toast, transI18n, useI18n } from '~ui-kit';
import { HomeApi } from '../../api/home';
import { addResource } from '../../components/i18n';
import { HomeSettingContainer } from './home-setting';
import { LoginForm } from './login-form';
import { MessageDialog } from './message-dialog';
import './style.css';
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

export const useBuilderConfig = () => {
  const [configReady, setConfigReady] = useState(false);
  const builderResource = useRef({
    scenes: {},
    themes: {},
  });
  const t = useI18n();

  const defaultScenes = [
    { text: t('home.roomType_1v1'), value: `${EduRoomTypeEnum.Room1v1Class}` },
    { text: t('home.roomType_interactiveSmallClass'), value: `${EduRoomTypeEnum.RoomSmallClass}` },
    { text: t('home.roomType_interactiveBigClass'), value: `${EduRoomTypeEnum.RoomBigClass}` },
  ];

  const [roomTypes, setRoomTypes] = useState<EduRoomTypeEnum[]>([]);

  const sceneOptions = defaultScenes.filter(({ value }) => {
    return roomTypes.some((t) => `${t}` === value);
  });

  useEffect(() => {
    const companyId = window.__launchCompanyId;
    const projectId = window.__launchProjectId;

    if (companyId && projectId) {
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
        setConfigReady(true);
      });
    } else {
      setConfigReady(true);
      setRoomTypes(AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType));
    }
  }, []);

  return {
    builderResource,
    sceneOptions: sceneOptions.length ? sceneOptions : defaultScenes,
    configReady,
  };
};

export const HomePage = () => {
  const globalStore = useContext(GlobalStoreContext);
  const history = useHistory();

  const [duration] = useState<string>(`${30}`);

  const [loading, setLoading] = useState<boolean>(false);

  const t = useI18n();

  const { builderResource, sceneOptions, configReady } = useBuilderConfig();

  useEffect(() => {
    const language = window.__launchLanguage || globalStore.language || getBrowserLanguage();
    const region =
      window.__launchRegion || globalStore.region || regionByLang[getBrowserLanguage()];
    globalStore.setLanguage(language as LanguageEnum);
    globalStore.setRegion(region as EduRegion);
  }, []);

  useEffect(() => {
    if (history.location.pathname === '/share' && configReady) {
      setTimeout(() => {
        handleSubmit({
          roleType: window.__launchRoleType,
          roomType: window.__launchRoomType,
          roomName: window.__launchRoomName,
          userName: `user_${''.padEnd(6, `${Math.floor(Math.random() * 10000)}`)}`,
        });
      });
    }
  }, [configReady]);

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
    const language = globalStore.language || getBrowserLanguage();
    const region = globalStore.region || regionByLang[getBrowserLanguage()];

    const userRole = parseInt(roleType);

    const roomType = parseInt(rt);

    const userUuid = `${md5(userName)}${userRole}`;

    const roomUuid = `${md5(roomName)}${roomType}`;

    try {
      setLoading(true);

      const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;

      const { token, appId } = await HomeApi.shared.loginNoAuth(userUuid, roomUuid, userRole);

      const companyId = window.__launchCompanyId;
      const projectId = window.__launchProjectId;

      const shareUrl =
        AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron
          ? ''
          : `${location.origin}${
              location.pathname
            }?roomName=${roomName}&roomType=${roomType}&region=${region}&language=${language}&roleType=${
              EduRoleTypeEnum.student
            }&companyId=${companyId ?? ''}&projectId=${projectId ?? ''}#/share`;

      console.log('## get rtm Token from demo server', token);

      const config: GlobalLaunchOption = {
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
      globalStore.setLaunchConfig(config);
      history.push('/launch');
    } catch (e) {
      globalStore.addToast({
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
          <Layout className="justify-between items-center">
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
                <SettingsButton />
              </span>
            </Layout>
          </Layout>
        </nav>
        <div
          className="form-section fixed animated-form"
          style={{
            top: 'calc((100% - 540px) * 0.5)',
            left: 'calc((100% - 477px) * 0.81)',
            padding: '36px 54px 26px',
          }}>
          <LoginForm onSubmit={handleSubmit} sceneOptions={sceneOptions} />
        </div>
      </div>
    </Fragment>
  );
};

const HomeToastContainer: FC = observer(() => {
  const { toastList, removeToast } = useContext(GlobalStoreContext);
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

export const SettingsButton = () => {
  const t = useI18n();
  const [hover, setHover] = useState(false);
  const handleOver = () => {
    setHover(true);
  };

  const handleLeave = () => {
    setHover(false);
  };

  const textColor = hover ? '#fff' : '#030303';
  const backgroundColor = hover ? '#030303' : '#fff';

  return (
    <HomeSettingContainer>
      <Button
        animate={false}
        onMouseOver={handleOver}
        onMouseLeave={handleLeave}
        style={{ background: backgroundColor, transition: 'all .2s' }}>
        <div className="flex items-center">
          <SvgImg type={SvgIconEnum.SET_OUTLINE} size={16} colors={{ iconPrimary: textColor }} />
          <span className="ml-1" style={{ color: textColor }}>
            {t('fcr_settings_setting')}
          </span>
        </div>
      </Button>
    </HomeSettingContainer>
  );
};
