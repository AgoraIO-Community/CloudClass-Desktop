import { HomeSettingContainer } from '@/app/pages/home/home-setting';
import { HomeLaunchOption } from '@/app/stores/home';
import { LanguageEnum } from '@/infra/api';
import { useHomeStore } from '@/infra/hooks';
import { ToastType } from '@/infra/stores/common/share-ui';
import { GlobalStorage, storage } from '@/infra/utils';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import {
  EduClassroomConfig,
  EduRegion,
  EduRoleTypeEnum,
  EduRoomServiceTypeEnum,
  EduRoomSubtypeEnum,
  EduRoomTypeEnum,
} from 'agora-edu-core';
import dayjs from 'dayjs';
import MD5 from 'js-md5';
import { observer } from 'mobx-react';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { Toast, transI18n } from '~ui-kit';
import { Home } from '~ui-kit/scaffold';
import { useTheme } from '.';
import { HomeApi } from './home-api';
import { MessageDialog } from './message-dialog';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_PUBLISH_DATE = process.env.REACT_APP_PUBLISH_DATE || '';
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

const SCENARIOS_ROOM_SUBTYPE_MAP: { [key: string]: EduRoomSubtypeEnum } = {
  'vocational-class': EduRoomSubtypeEnum.Vocational,
  'big-class': EduRoomSubtypeEnum.Standard,
  '1v1': EduRoomSubtypeEnum.Standard,
  'mid-class': EduRoomSubtypeEnum.Standard,
};
const SCENARIOS_ROOM_SERVICETYPE_MAP: { [key: string]: EduRoomServiceTypeEnum } = {
  'premium-service': EduRoomServiceTypeEnum.RTC,
  'standard-service': EduRoomServiceTypeEnum.Live,
  'latency-service': EduRoomServiceTypeEnum.BlendCDN,
  'mix-service': EduRoomServiceTypeEnum.MixRTCCDN,
  'mix-stream-cdn-service': EduRoomServiceTypeEnum.MixStreamCDN,
  'hosting-scene': EduRoomServiceTypeEnum.HostingScene,
};

// 1. 伪直播场景不需要pretest
// 2. 合流转推场景下的学生角色不需要pretest
export const vocationalNeedPreset = (
  roleType: EduRoleTypeEnum,
  roomServiceType: EduRoomServiceTypeEnum,
  roomSubtype: EduRoomSubtypeEnum,
) => {
  return !(
    EduRoomSubtypeEnum.Vocational === roomSubtype &&
    (roomServiceType === EduRoomServiceTypeEnum.HostingScene ||
      (roomServiceType === EduRoomServiceTypeEnum.MixStreamCDN &&
        roleType !== EduRoleTypeEnum.teacher))
  );
};

export const VocationalHomePage = observer(() => {
  const homeStore = useHomeStore();
  const { launchConfig, language, region } = homeStore;
  useTheme();
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>(launchConfig.userRole || '');
  const [curScenario, setScenario] = useState<string>(launchConfig.curScenario || '');
  const [curService, setService] = useState<string>(launchConfig.curService || '');
  const [duration, setDuration] = useState<number>(launchConfig.duration / 60 || 30);
  const [debug, setDebug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const onChangeRegion = (r: string) => {};
  const onChangeLanguage = (language: string) => {};
  const role = useMemo(() => {
    const roles = {
      teacher: EduRoleTypeEnum.teacher,
      assistant: EduRoleTypeEnum.assistant,
      student: EduRoleTypeEnum.student,
      incognito: EduRoleTypeEnum.invisible,
    };
    return roles[userRole];
  }, [userRole]);

  const scenario = useMemo(() => {
    const scenes = {
      '1v1': EduRoomTypeEnum.Room1v1Class,
      'mid-class': EduRoomTypeEnum.RoomSmallClass,
      'big-class': EduRoomTypeEnum.RoomBigClass,
      'vocational-class': EduRoomTypeEnum.RoomBigClass,
    };
    return scenes[curScenario];
  }, [curScenario]);

  const roomSubtype = SCENARIOS_ROOM_SUBTYPE_MAP[curScenario];

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

  const onChangeService = (value?: string) => {
    if (value) {
      setService(value);
    }
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

  const onSubmit = async () => {
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

      const { token, appId } = await HomeApi.shared.login(userUuid, roomUuid, role);
      console.log('## get rtm Token from demo server', token);
      const roomServiceType = SCENARIOS_ROOM_SERVICETYPE_MAP[curService];
      const channelProfile = roomServiceType === EduRoomServiceTypeEnum.RTC ? 0 : 1;
      const webRTCCodec =
        roomServiceType === EduRoomServiceTypeEnum.BlendCDN ||
        roomServiceType === EduRoomServiceTypeEnum.MixRTCCDN
          ? 'h264'
          : 'vp8';
      const webRTCMode = roomServiceType === EduRoomServiceTypeEnum.Live ? 'live' : 'rtc';

      const needPretest = vocationalNeedPreset(role, roomServiceType, roomSubtype);

      const config: HomeLaunchOption = {
        appId,
        sdkDomain: domain,
        pretest: needPretest,
        courseWareList: courseWareList.slice(0, 1),
        language: language as LanguageEnum,
        userUuid: `${userUuid}`,
        rtmToken: token,
        roomUuid: `${roomUuid}`,
        roomType: scenario,
        roomSubtype,
        roomServiceType,
        roomName: `${roomName}`,
        userName: userName,
        roleType: role,
        region: region as EduRegion,
        duration: duration * 60,
        latencyLevel: 2,
        curScenario,
        curService,
        userRole,
        mediaOptions: {
          channelProfile,
          web: {
            codec: webRTCCodec,
            mode: webRTCMode,
          },
        },
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
          ...config.mediaOptions,
          encryptionConfig: {
            key: encryptionKey,
            mode: parseInt(encryptionMode),
          },
        };
      }
      GlobalStorage.save('platform', 'web');
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

  return !!language ? (
    <React.Fragment>
      <MessageDialog />
      <Home
        isVocational={true}
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
        service={curService}
        duration={duration}
        region={region as string}
        language={language as string}
        onChangeRegion={onChangeRegion}
        onChangeLanguage={onChangeLanguage}
        debug={debug}
        encryptionMode={encryptionMode}
        encryptionKey={encryptionKey}
        onChangeEncryptionMode={onChangeEncryptionMode}
        onChangeEncryptionKey={onChangeEncryptionKey}
        onChangeDebug={onChangeDebug}
        onChangeRole={onChangeRole}
        onChangeScenario={onChangeScenario}
        onChangeService={onChangeService}
        onChangeRoomId={onChangeRoomId}
        onChangeUserId={onChangeUserId}
        onChangeRoomName={onChangeRoomName}
        onChangeUserName={onChangeUserName}
        onChangeDuration={(duration: number) => {
          setDuration(duration);
        }}
        loading={loading}
        onClick={onSubmit}
        showServiceOptions={true}
        headerRight={<HomeSettingContainer />}>
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
