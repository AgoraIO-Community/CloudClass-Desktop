import { useHomeStore } from '@/infra/hooks';
import { changeLanguage, Home, transI18n, Toast } from '~ui-kit';
import { getBrowserLanguage, storage } from '@/infra/utils';
import { observer } from 'mobx-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router';
import { LanguageEnum } from '@/infra/api';
import { HomeLaunchOption } from '@/infra/stores/home';
import { EduClassroomConfig, EduRegion, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { MessageDialog } from './message-dialog';
import { HomeApi } from './home-api';
import { v4 as uuidv4 } from 'uuid';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import MD5 from 'js-md5';
import { ToastType } from '@/infra/stores/common/share-ui';
import dayjs from 'dayjs';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

declare const CLASSROOM_SDK_VERSION: string;
declare const BUILD_TIME: string;
declare const BUILD_COMMIT_ID: string;

const regionByLang = {
  zh: EduRegion.CN,
  en: EduRegion.NA,
};

export const HomePage = observer(() => {
  const homeStore = useHomeStore();

  const launchConfig = homeStore.launchConfig;

  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>(launchConfig.userRole || '');
  const [curScenario, setScenario] = useState<string>(launchConfig.curScenario || '');
  const [duration, setDuration] = useState<number>(launchConfig.duration / 60 || 30);
  const [language, setLanguage] = useState<string>('');
  const [region, setRegion] = useState<EduRegion>(EduRegion.CN);
  const [debug, setDebug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const lang = homeStore.launchOption.language || getBrowserLanguage();
    changeLanguage(lang);
    setLanguage(lang);
    const region = homeStore.region || regionByLang[getBrowserLanguage()];
    setRegion(region);
  }, []);

  const onChangeRegion = (r: string) => {
    const region = r as EduRegion;
    setRegion(region);
    homeStore.setRegion(region);
  };

  const onChangeLanguage = (language: string) => {
    changeLanguage(language);
    setLanguage(language);
  };

  const role = useMemo(() => {
    const roles = {
      teacher: EduRoleTypeEnum.teacher,
      assistant: EduRoleTypeEnum.assistant,
      student: EduRoleTypeEnum.student,
      incognito: EduRoleTypeEnum.invisible,
      observer: EduRoleTypeEnum.observer,
    };
    return roles[userRole];
  }, [userRole]);

  const scenario = useMemo(() => {
    const scenes = {
      '1v1': EduRoomTypeEnum.Room1v1Class,
      'mid-class': EduRoomTypeEnum.RoomSmallClass,
      'big-class': EduRoomTypeEnum.RoomBigClass,
    };
    return scenes[curScenario];
  }, [curScenario]);

  const userUuid = useMemo(() => {
    if (!debug) {
      return `${MD5(userName)}${role}`;
    }
    return `${userId}`;
  }, [role, userName, debug, userId]);

  const roomUuid = useMemo(() => {
    if (!debug) {
      return `${roomName}${scenario}`;
    }
    return `${roomId}`;
  }, [scenario, roomName, debug, roomId]);

  const onChangeRole = (value: string) => {
    setRole(value);
  };

  const onChangeScenario = (value: string) => {
    setScenario(value);
  };

  const text: Record<string, CallableFunction> = {
    roomId: setRoomId,
    userName: setUserName,
    roomName: setRoomName,
    userId: setUserId,
    encryptionMode: setEncryptionMode,
    encryptionKey: setEncryptionKey,
  };

  const onChangeRoomId = (newValue: string) => {
    text['roomId'](newValue);
  };

  const onChangeUserId = (newValue: string) => {
    text['userId'](newValue);
  };

  const onChangeRoomName = (newValue: string) => {
    text['roomName'](newValue);
  };

  const onChangeUserName = (newValue: string) => {
    text['userName'](newValue);
  };

  const onChangeDebug = (newValue: boolean) => {
    setDebug(newValue);
  };

  const onChangeEncryptionMode = (newValue: string) => {
    text['encryptionMode'](newValue);
  };

  const onChangeEncryptionKey = (newValue: string) => {
    text['encryptionKey'](newValue);
  };

  const history = useHistory();

  const [courseWareList] = useState<any[]>(storage.getCourseWareSaveList());

  let tokenDomain = '';
  let tokenDomainCollection: any = {};

  try {
    tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
  } catch (e) {
    tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
  }

  const buildTime = dayjs(+BUILD_TIME || 0).format('YYYY-MM-DD HH:mm:ss');
  const commitID = BUILD_COMMIT_ID;

  return language !== '' ? (
    <React.Fragment>
      <MessageDialog />
      <Home
        version={CLASSROOM_SDK_VERSION}
        SDKVersion={EduClassroomConfig.getRtcVersion()}
        buildTime={buildTime}
        commitID={commitID}
        roomId={roomUuid}
        userId={userUuid}
        roomName={roomName}
        userName={userName}
        role={userRole}
        scenario={curScenario}
        duration={duration}
        region={region}
        debug={debug}
        encryptionMode={encryptionMode}
        encryptionKey={encryptionKey}
        onChangeEncryptionMode={onChangeEncryptionMode}
        onChangeEncryptionKey={onChangeEncryptionKey}
        onChangeDebug={onChangeDebug}
        onChangeRegion={onChangeRegion}
        onChangeRole={onChangeRole}
        onChangeScenario={onChangeScenario}
        onChangeRoomId={onChangeRoomId}
        onChangeUserId={onChangeUserId}
        onChangeRoomName={onChangeRoomName}
        onChangeUserName={onChangeUserName}
        onChangeDuration={(duration: number) => {
          setDuration(duration);
        }}
        language={language}
        onChangeLanguage={onChangeLanguage}
        loading={loading}
        onClick={async () => {
          try {
            setLoading(true);
            const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;
            if (!tokenDomain && tokenDomainCollection) {
              switch (region) {
                case 'CN':
                  tokenDomain = tokenDomainCollection['prod_cn'];
                  break;
                case 'AP':
                  tokenDomain = tokenDomainCollection['prod_ap'];
                  break;
                case 'NA':
                  tokenDomain = tokenDomainCollection['prod_na'];
                  break;
                case 'EU':
                  tokenDomain = tokenDomainCollection['prod_eu'];
                  break;
              }
            }

            HomeApi.shared.domain = tokenDomain;

            const { rtmToken, appId } = await HomeApi.shared.login(userUuid);
            console.log('## get rtm Token from demo server', rtmToken);

            const config: HomeLaunchOption = {
              appId,
              sdkDomain: domain,
              pretest: true,
              courseWareList: courseWareList.slice(0, 1),
              language: language as LanguageEnum,
              userUuid: `${userUuid}`,
              rtmToken,
              roomUuid: `${roomUuid}`,
              roomType: scenario,
              roomName: `${roomName}`,
              userName: userName,
              roleType: role,
              region,
              duration: duration * 60,
              latencyLevel: 2,
              userRole,
              curScenario,
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

            if (encryptionKey && encryptionMode) {
              config.mediaOptions = {
                encryptionConfig: {
                  key: encryptionKey,
                  mode: parseInt(encryptionMode),
                },
              };
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
        }}>
        <HomeToastContainer />
      </Home>
    </React.Fragment>
  ) : null;
});

const HomeToastContainer: React.FC = observer(() => {
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
