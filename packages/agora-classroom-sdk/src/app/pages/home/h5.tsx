import { HomeSettingContainerH5 } from '@/app/pages/home/home-setting/h5';
import { HomeLaunchOption } from '@/app/stores/home';
import { LanguageEnum } from '@/infra/api';
import { useHomeStore } from '@/infra/hooks';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { getBrowserLanguage, storage } from '@/infra/utils';
import { applyTheme, loadGeneratedFiles, themes } from '@/infra/utils/config-loader';
import {
  EduClassroomConfig,
  EduRegion,
  EduRoleTypeEnum,
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
import { MessageDialog } from './message-dialog';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;
const useTheme = () => {
  useEffect(() => {
    loadGeneratedFiles();
    const theme = themes['default'][FcrMultiThemeMode.light];
    applyTheme(theme);
  }, []);
};
export const HomeH5Page = observer(() => {
  const homeStore = useHomeStore();
  const launchConfig = homeStore.launchConfig;

  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>('student');
  const [curScenario, setScenario] = useState<string>('big-class');
  const [duration] = useState<number>(30);
  const [language, setLanguage] = useState<string>('');
  const [region] = useState<EduRegion>(EduRegion.CN);
  const [debug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  useTheme();
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
      return `${md5(userName)}${role}`;
    }
    return `${userId}`;
  }, [role, userName, debug, userId]);

  const roomUuid = useMemo(() => {
    if (!debug) {
      return `${md5(roomName)}${scenario}`;
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
      <H5Login
        version={CLASSROOM_SDK_VERSION}
        SDKVersion={EduClassroomConfig.getRtcVersion()}
        roomId={roomUuid}
        userId={userUuid}
        roomName={roomName}
        userName={userName}
        role={userRole}
        scenario={curScenario}
        duration={duration}
        onChangeScenario={onChangeScenario}
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
            roomName: `${roomName}`,
            userName: userName,
            roleType: role,
            startTime: Date.now(),
            region,
            duration: duration * 60,
            latencyLevel: 2,
            platform: Platform.H5,
            // @ts-ignore
            curScenario,
            // @ts-ignore
            userRole,
          };
          if (encryptionKey && encryptionMode) {
            config!.mediaOptions!.encryptionConfig = {
              key: encryptionKey,
              mode: parseInt(encryptionMode),
            };
          }
          homeStore.setLaunchConfig(config);
          history.replace('/launch');
        }}
      />
      <HomeSettingContainerH5 />
    </React.Fragment>
  ) : null;
});
