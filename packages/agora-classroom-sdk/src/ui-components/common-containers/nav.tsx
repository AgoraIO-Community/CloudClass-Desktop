import { useAppStore, useRoomStore, useUIStore } from '@/hooks';
import { BizHeader, Modal, Button } from 'agora-scenario-ui-kit';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import { Exit } from './dialog';
import { SettingContainer } from './setting';
import { homeApi } from '@/services/home-api';
import { EduRoleTypeEnum, GenericErrorWrapper } from 'agora-rte-sdk';
import { eduSDKApi } from '@/services/edu-sdk-api';

export const NavigationBar: React.FC<any> = observer(() => {
  const roomStore = useRoomStore();

  const navigationState = roomStore.navigationState;

  const uiStore = useUIStore();

  const appStore = useAppStore();

  const handleClick = useCallback(
    async (type: string) => {
      switch (type) {
        case 'exit': {
          uiStore.addDialog(Exit);
          break;
        }
        case 'record': {
          const roomUuid = roomStore.roomInfo.roomUuid;
          const tokenRule = `${roomUuid}-record-${Date.now()}`;
          // 生成token home-api login
          const { rtmToken, userUuid } = await homeApi.login(tokenRule);
          const urlParams = {
            userUuid, // 用户uuid
            userName: 'agora incognito', // 用户昵称
            roomUuid, // 房间uuid
            roleType: EduRoleTypeEnum.invisible, // 角色
            roomType: roomStore.roomInfo.roomType, // 房间类型
            roomName: roomStore.roomInfo.roomName, // 房间名称x
            // listener: 'ListenerCallback', // launch状态 todo 在页面中处理
            pretest: false, // 开启设备检测
            rtmUid: userUuid,
            rtmToken, // rtmToken
            language: appStore.params.language, // 国际化
            startTime: appStore.params.startTime, // 房间开始时间
            duration: appStore.params.duration, // 课程时长
            recordUrl: appStore.params.config.recordUrl, // 回放页地址
            appId: appStore.params.config.agoraAppId,
            userRole: EduRoleTypeEnum.invisible,
          };
          if (!urlParams.recordUrl) {
            // urlParams.recordUrl = 'https://webdemo.agora.io/aclass/#/invisible/courses'
            urlParams.recordUrl =
              'https://webdemo.agora.io/gqf-incognito-record';
            // throw GenericErrorWrapper()
            // return;
          }
          const urlParamsStr = Object.keys(urlParams)
            .map((key) => key + '=' + encodeURIComponent(urlParams[key]))
            .join('&');
          const url = `${urlParams.recordUrl}?${urlParamsStr}`;
          console.log({ urlParams, url });
          // todo fetch
          await eduSDKApi.updateRecordingState({
            roomUuid,
            state: 1,
            url,
          });
          break;
        }
        case 'setting': {
          uiStore.setVisibleSetting(true);
          break;
        }
        case 'courseControl': {
          console.log('courseControl');
          break;
        }
      }
    },
    [navigationState.isStarted, uiStore],
  );

  return (
    <>
      <BizHeader
        classStatusText={navigationState.classTimeText}
        isStarted={navigationState.isStarted}
        title={navigationState.title}
        signalQuality={navigationState.signalQuality}
        monitor={{
          cpuUsage: navigationState.cpuUsage,
          networkLatency: navigationState.networkLatency,
          networkQuality: navigationState.networkQuality,
          packetLostRate: navigationState.packetLostRate,
        }}
        onClick={handleClick}
      />
      <SettingContainer />
    </>
  );
});
