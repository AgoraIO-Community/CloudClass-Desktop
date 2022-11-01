import { roomApi } from '@/app/api';
import { GlobalStoreContext } from '@/app/stores';
import { GlobalLaunchOption } from '@/app/stores/global';
import { courseware } from '@/app/utils/courseware';
import { LanguageEnum } from '@/infra/api';
import {
  EduClassroomConfig,
  EduRegion,
  EduRoleTypeEnum,
  EduRoomServiceTypeEnum,
  EduRoomTypeEnum,
  Platform,
} from 'agora-edu-core';
import { AgoraLatencyLevel } from 'agora-rte-sdk';
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import React, { useContext, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { H5Login } from '~ui-kit/scaffold';
import { HomeSettingContainerH5 } from './home-setting/h5';
import { MessageDialog } from './message-dialog';
import { useTheme } from './vocational';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_PUBLISH_DATE = process.env.REACT_APP_PUBLISH_DATE || '';
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

const SCENARIOS_ROOM_SUBTYPE_MAP: { [key: string]: number } = {
  'vocational-class': 1,
  'big-class': 0,
  '1v1': 0,
  'mid-class': 0,
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
  useTheme();
  const { launchConfig, setLaunchConfig, language, setLanguage } = useContext(GlobalStoreContext);
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>('student');
  const [curScenario, setScenario] = useState<string>('');
  const [curService, setService] = useState<string>('');
  const [duration] = useState<number>(30);
  const [region] = useState<EduRegion>(EduRegion.CN);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  const onChangeLanguage = (lang: string) => {
    setLanguage(lang as any);
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

  const [courseWareList] = useState(courseware.getList());

  let tokenDomain = '';
  let tokenDomainCollection: any = {};

  try {
    tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
  } catch (e) {
    tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
  }

  return (
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
        showServiceOptions={true}
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

          const { token, appId } = await roomApi.getCredentialNoAuth({
            userUuid,
            roomUuid,
            role,
          });

          const roomServiceType = SCENARIOS_ROOM_SERVICETYPE_MAP[curService];
          const webRTCCodec =
            roomServiceType === EduRoomServiceTypeEnum.CDN ||
            roomServiceType === EduRoomServiceTypeEnum.Fusion
              ? 'h264'
              : 'vp8';
          const latencyLevel =
            roomServiceType === EduRoomServiceTypeEnum.LivePremium
              ? AgoraLatencyLevel.UltraLow
              : AgoraLatencyLevel.Low;
          const config: GlobalLaunchOption = {
            appId,
            sdkDomain: domain,
            pretest: false,
            courseWareList: courseWareList.slice(0, 1),
            language: language as LanguageEnum,
            userUuid: `${userUuid}`,
            rtmToken: token,
            roomUuid: `${roomUuid}`,
            roomType: scenario,
            roomServiceType,
            roomName: `${roomName}`,
            userName: userName,
            roleType: role,
            // startTime: Date.now(), // 开启后会导致学生进入新教室的时候直接开启上课计时
            region,
            duration: duration * 60,
            latencyLevel,
            platform: Platform.H5,
            mediaOptions: {
              web: {
                codec: webRTCCodec,
              },
            },
          };
          if (encryptionKey && encryptionMode) {
            config!.mediaOptions!.encryptionConfig = {
              key: encryptionKey,
              mode: parseInt(encryptionMode),
            };
          }
          setLaunchConfig(config);
          history.replace('/launch');
        }}
      />
    </React.Fragment>
  );
});
