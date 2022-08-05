import { HomeLaunchOption } from '@/app/stores/home';
import { LanguageEnum } from '@/infra/api';
import { useHomeStore } from '@/infra/hooks';
import { ToastType } from '@/infra/stores/common/share-ui';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { GlobalStorage, storage } from '@/infra/utils';
import { applyTheme, loadGeneratedFiles, themes } from '@/infra/utils/config-loader';
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
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { Toast, transI18n } from '~ui-kit';
import { Home } from '~ui-kit/scaffold';
import { HomeApi } from './home-api';
import { HomeSettingContainer } from './home-setting';
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
  'premium-service': EduRoomServiceTypeEnum.LivePremium,
  'standard-service': EduRoomServiceTypeEnum.LiveStandard,
  'latency-service': EduRoomServiceTypeEnum.CDN,
  'mix-service': EduRoomServiceTypeEnum.Fusion,
  'mix-stream-cdn-service': EduRoomServiceTypeEnum.MixStreamCDN,
  'hosting-scene': EduRoomServiceTypeEnum.HostingScene,
};

export const webRTCCodecH264 = [
  EduRoomServiceTypeEnum.CDN,
  EduRoomServiceTypeEnum.Fusion,
  EduRoomServiceTypeEnum.MixStreamCDN,
  EduRoomServiceTypeEnum.HostingScene,
];

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
export const useTheme = () => {
  useEffect(() => {
    loadGeneratedFiles();
    const theme = themes['default'][FcrMultiThemeMode.light];
    applyTheme(theme);
  }, []);
};
export const VocationalHomePage = observer(() => {
  const homeStore = useHomeStore();
  useTheme();
  const { launchConfig, language, region } = homeStore;
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>(launchConfig.userRole || '');
  const [curScenario, setScenario] = useState<string>(launchConfig.curScenario || '');
  const [curService, setService] = useState<string>(launchConfig.curService || '');
  const [duration, setDuration] = useState<number>(launchConfig.duration / 60 || 30);
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
    return `${md5(userName)}${userRole}`;
  }, [role, userName, userId]);

  const roomUuid = useMemo(() => {
    return `${md5(roomName)}${scenario}`;
  }, [scenario, roomName, roomId]);

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

      const { token, appId } = await HomeApi.shared.loginV3(userUuid, roomUuid, role);
      console.log('## get rtm Token from demo server', token);
      const roomServiceType = SCENARIOS_ROOM_SERVICETYPE_MAP[curService];
      const channelProfile = roomServiceType === EduRoomServiceTypeEnum.LivePremium ? 0 : 1;
      const webRTCCodec = webRTCCodecH264.includes(roomServiceType) ? 'h264' : 'vp8';
      const webRTCMode = roomServiceType === EduRoomServiceTypeEnum.LiveStandard ? 'live' : 'rtc';

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
        curService,
        // @ts-ignore
        curScenario,
        // @ts-ignore
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
        showServiceOptions={false}
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
        encryptionMode={encryptionMode}
        encryptionKey={encryptionKey}
        onChangeEncryptionMode={onChangeEncryptionMode}
        onChangeEncryptionKey={onChangeEncryptionKey}
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
