import { useHomeStore } from '@/infra/hooks';
import { changeLanguage, Home } from '~ui-kit';
import { getBrowserLanguage, storage } from '@/infra/utils';
import { observer } from 'mobx-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router';
import { LanguageEnum } from '@/infra/api';
import { HomeLaunchOption } from '@/infra/stores/home';
import { EduClassroomConfig, EduRegion, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { MessageDialog } from './message-dialog';
import { HomeApi } from './home-api';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_PUBLISH_DATE = process.env.REACT_APP_PUBLISH_DATE || '';
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

export const HomePage = observer(() => {
  const homeStore = useHomeStore();

  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setRole] = useState<string>('');
  const [curScenario, setScenario] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [language, setLanguage] = useState<string>('');
  const [region, setRegion] = useState<EduRegion>(homeStore.region);
  const [debug, setDebug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  useEffect(() => {
    const lang = homeStore.launchOption.language || getBrowserLanguage();
    changeLanguage(lang);
    setLanguage(lang);
  }, []);

  const onChangeRegion = (r: string) => {
    const region = r as EduRegion;
    setRegion(region);
    homeStore.region = region;
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
      return `${userName}${role}`;
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

  return language !== '' ? (
    <React.Fragment>
      <MessageDialog />
      <Home
        version={EduClassroomConfig.getVersion()}
        SDKVersion={EduClassroomConfig.getRtcVersion()}
        publishDate={REACT_APP_PUBLISH_DATE}
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
          const { rtmToken, appId } = await HomeApi.shared.login(userUuid);
          console.log('## rtm Token', rtmToken);

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
            startTime: Date.now(),
            region,
            duration: duration * 60,
            latencyLevel: 2,
          };
          if (encryptionKey && encryptionMode) {
            config!.mediaOptions!.encryptionConfig = {
              key: encryptionKey,
              mode: parseInt(encryptionMode),
            };
          }
          homeStore.setLaunchConfig(config);
          history.push('/launch');
        }}
      />
    </React.Fragment>
  ) : null;
});
