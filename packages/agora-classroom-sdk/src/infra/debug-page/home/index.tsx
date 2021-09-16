import { useAudienceParams, useHomeStore } from '@/infra/hooks';
import { changeLanguage, Home } from '~ui-kit';
import { storage } from '@/infra/utils';
import { homeApi, LanguageEnum } from 'agora-edu-core';
import { EduRoleTypeEnum, EduSceneType } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router';
import { AgoraRegion } from '@/infra/api';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { HomeLaunchOption } from '@/infra/stores/app/home';

export const HomePage = observer(() => {
  const homeStore = useHomeStore();
  const params = useAudienceParams();

  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setRole] = useState<string>('');
  const [curScenario, setScenario] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [language, setLanguage] = useState<string>(sessionStorage.getItem('language') || 'zh');
  const [region, setRegion] = useState<AgoraRegion>(homeStore.region);
  const [debug, setDebug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  useEffect(() => {
    changeLanguage(language);
    setLanguage(language);
  }, []);

  const onChangeRegion = (r: string) => {
    let region = r as AgoraRegion;
    setRegion(region);
    homeStore.region = region;
  };

  const onChangeLanguage = (language: string) => {
    sessionStorage.setItem('language', language);
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
      '1v1': EduSceneType.Scene1v1,
      'mid-class': EduSceneType.SceneMedium,
      'big-class': EduSceneType.SceneLarge,
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

  const [courseWareList, updateCourseWareList] = useState<any[]>(storage.getCourseWareSaveList());
  const SDKVersion = window.isElectron
    ? // @ts-ignore
      window.rtcEngine.getVersion().version
    : AgoraRTC.VERSION;
  return (
    <Home
      version={REACT_APP_BUILD_VERSION}
      SDKVersion={SDKVersion}
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
      // onChangeStartDate={(date: Date) => {
      //   setStartDate(date)
      // }}
      onChangeDuration={(duration: number) => {
        setDuration(duration);
      }}
      language={language}
      onChangeLanguage={onChangeLanguage}
      onClick={async () => {
        const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`.match('api.agora.io')
          ? 'https://api-solutions.%region%.agoralab.co'
          : REACT_APP_AGORA_APP_SDK_DOMAIN;
        homeApi.setRegion(region, domain);
        let { rtmToken, appId } = await homeApi.login(userUuid);
        console.log('## rtm Token', rtmToken);
        const cameraEncoderConfiguration =
          EduSceneType.SceneMedium === scenario
            ? {
                width: 160,
                height: 120,
                bitrate: 65,
                frameRate: 15,
              }
            : {
                width: 320,
                height: 240,
                frameRate: 15,
                bitrate: 1000,
              };
        let config: HomeLaunchOption = {
          // rtmUid: userUuid,
          appId,
          pretest: true,
          courseWareList: courseWareList.slice(0, 1),
          personalCourseWareList: courseWareList.slice(1, courseWareList.length),
          language: language as LanguageEnum,
          userUuid: `${userUuid}`,
          rtmToken,
          roomUuid: `${roomUuid}`,
          roomType: scenario,
          roomName: `${roomName}`,
          userName: userName,
          roleType: role,
          startTime: +new Date(),
          region,
          duration: duration * 60,
          mediaOptions: {
            cameraEncoderConfiguration,
          },
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
  );
});
