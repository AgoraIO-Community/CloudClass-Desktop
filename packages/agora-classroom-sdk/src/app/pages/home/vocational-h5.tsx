import { HomeLaunchOption } from '@/app/stores/home';
import { LanguageEnum } from '@/infra/api';
import { useHomeStore } from '@/infra/hooks';
import { getBrowserLanguage, GlobalStorage, storage } from '@/infra/utils';
import {
  EduClassroomConfig,
  EduRegion,
  EduRoleTypeEnum,
  EduRoomServiceTypeEnum,
  EduRoomSubtypeEnum,
  EduRoomTypeEnum,
  Platform,
} from 'agora-edu-core';
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { changeLanguage } from '~ui-kit';
import { H5Login } from '~ui-kit/scaffold';
import { HomeApi } from './home-api';
import { HomeSettingContainerH5 } from './home-setting/h5';
import { MessageDialog } from './message-dialog';
import { useTheme } from './vocational';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_PUBLISH_DATE = process.env.REACT_APP_PUBLISH_DATE || '';
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

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

export const VocationalHomeH5Page = observer(() => {
  const homeStore = useHomeStore();
  useTheme();
  const { launchConfig } = homeStore;
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>('student');
  const [curScenario, setScenario] = useState<string>(launchConfig.curScenario || '');
  const [curService, setService] = useState<string>(launchConfig.curService || '');
  const [duration] = useState<number>(30);
  const [language, setLanguage] = useState<string>('');
  const [region] = useState<EduRegion>(EduRegion.CN);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  useEffect(() => {
    const lang = homeStore.launchOption.language || getBrowserLanguage();
    changeLanguage(lang);
    setLanguage(lang);
  }, []);

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

  const onChangeService = (value: string) => {
    setService(value);
  };

  const text: Record<string, CallableFunction> = {
    roomId: setRoomId,
    userName: setUserName,
    roomName: setRoomName,
    userId: setUserId,
    encryptionMode: setEncryptionMode,
    encryptionKey: setEncryptionKey,
  };

  const onChangeRoomName = (newValue: string) => {
    text['roomName'](newValue);
  };

  const onChangeUserName = (newValue: string) => {
    text['userName'](newValue);
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

  return language !== '' ? (
    <React.Fragment>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="telephone=no" name="format-detection" />
      </Helmet>
      <MessageDialog />
      <HomeSettingContainerH5 />
      <H5Login
        isVocational={true}
        version={CLASSROOM_SDK_VERSION}
        SDKVersion={EduClassroomConfig.getRtcVersion()}
        publishDate={REACT_APP_PUBLISH_DATE}
        roomId={roomUuid}
        userId={userUuid}
        roomName={roomName}
        userName={userName}
        role={userRole}
        scenario={curScenario}
        service={curService}
        duration={duration}
        onChangeScenario={onChangeScenario}
        onChangeService={onChangeService}
        onChangeRoomName={onChangeRoomName}
        onChangeUserName={onChangeUserName}
        language={language}
        onChangeLanguage={onChangeLanguage}
        onClick={async () => {
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
          const roomServiceType = SCENARIOS_ROOM_SERVICETYPE_MAP[curService];
          const channelProfile = roomServiceType === EduRoomServiceTypeEnum.LivePremium ? 0 : 1;
          const webRTCCodec =
            roomServiceType === EduRoomServiceTypeEnum.CDN ||
            roomServiceType === EduRoomServiceTypeEnum.Fusion
              ? 'h264'
              : 'vp8';
          const webRTCMode =
            roomServiceType === EduRoomServiceTypeEnum.LiveStandard ? 'live' : 'rtc';
          const config: HomeLaunchOption = {
            appId,
            sdkDomain: domain,
            pretest: false,
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
            // @ts-ignore
            curScenario,
            // @ts-ignore
            userRole,
            // startTime: Date.now(), // 开启后会导致学生进入新教室的时候直接开启上课计时
            region,
            duration: duration * 60,
            latencyLevel: 2,
            platform: Platform.H5,
            curService,
            mediaOptions: {
              channelProfile: channelProfile,
              web: {
                codec: webRTCCodec,
                mode: webRTCMode,
              },
            },
          };
          if (encryptionKey && encryptionMode) {
            config!.mediaOptions!.encryptionConfig = {
              key: encryptionKey,
              mode: parseInt(encryptionMode),
            };
          }
          GlobalStorage.save('platform', 'h5');
          homeStore.setLaunchConfig(config);
          history.replace('/launch');
        }}
      />
    </React.Fragment>
  ) : null;
});
