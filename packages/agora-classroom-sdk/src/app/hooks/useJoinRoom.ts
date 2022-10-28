import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { EduRoleTypeEnum, EduRoomServiceTypeEnum, EduRoomTypeEnum, Platform } from 'agora-edu-core';
import { AgoraLatencyLevel, AgoraRegion } from 'agora-rte-sdk';
import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '../stores';
import { GlobalLaunchOption } from '../stores/global';
import { checkRoomInfoBeforeJoin, ErrorCode, h5ClassModeIsSupport, Status } from '../utils';
import { checkBrowserDevice } from '../utils/browser';
import { builderConfig } from '../utils/build-config';
import { courseware } from '../utils/courseware';
import {
  REACT_APP_AGORA_APP_CERTIFICATE,
  REACT_APP_AGORA_APP_ID,
  REACT_APP_AGORA_APP_SDK_DOMAIN,
} from '../utils/env';
import { shareLink } from '../utils/share';
import { LanguageEnum } from './../../infra/api/type';
import { failResult } from './../utils/result';

type JoinRoomParams = {
  role: EduRoleTypeEnum;
  roomType: EduRoomTypeEnum;
  roomServiceType: EduRoomServiceTypeEnum;
  roomName: string;
  userName: string;
  roomId: string;
  userId: string;
  duration?: number;
  token: string;
  appId: string;
  language: LanguageEnum;
  region: AgoraRegion;
  platform?: Platform;
};
type QuickJoinRoomParams = {
  role: EduRoleTypeEnum;
  roomId: string;
  nickName: string;
  platform: Platform;
  userId: string;
};

type JoinRoomOptions = Pick<GlobalLaunchOption, 'shareUrl' | 'uiMode'> & {
  roomProperties?: Record<string, any>;
};

export const webRTCCodecH264 = [
  EduRoomServiceTypeEnum.CDN,
  EduRoomServiceTypeEnum.Fusion,
  EduRoomServiceTypeEnum.MixStreamCDN,
  EduRoomServiceTypeEnum.HostingScene,
];

// 1. 伪直播场景不需要pretest
// 2. 合流转推场景下的学生角色不需要pretest
export const needPreset = (
  roomType: EduRoomTypeEnum,
  roomServiceType: EduRoomServiceTypeEnum,
  roleType: EduRoleTypeEnum,
) => {
  if (roomType !== EduRoomTypeEnum.RoomBigClass) {
    return true;
  }

  if (roomServiceType === EduRoomServiceTypeEnum.HostingScene) {
    return false;
  }

  if (
    roomServiceType === EduRoomServiceTypeEnum.MixStreamCDN &&
    roleType !== EduRoleTypeEnum.teacher
  ) {
    return false;
  }
  return true;
};

type ShareURLParams = {
  region: AgoraRegion;
  roomId: string;
  owner: string;
};

const shareLinkInClass = ({ roomId, owner }: ShareURLParams) => {
  const companyId = window.__launchCompanyId;
  const projectId = window.__launchProjectId;
  const region = window.__launchRegion;
  let url = shareLink.generateUrl({
    owner,
    roomId: roomId,
    role: EduRoleTypeEnum.student,
  });
  if (companyId && projectId) {
    url = url + `&companyId=${companyId}&projectId=${projectId}&region=${region}`;
  }
  return url;
};

const getLatencyLevel = (
  roomType: EduRoomTypeEnum,
  roomServiceType: EduRoomServiceTypeEnum,
): AgoraLatencyLevel => {
  // 极速直播场景
  const isLivePremium =
    roomType === EduRoomTypeEnum.RoomBigClass &&
    roomServiceType === EduRoomServiceTypeEnum.LivePremium;

  return isLivePremium ? AgoraLatencyLevel.UltraLow : AgoraLatencyLevel.Low;
};

const defaultPlatform = checkBrowserDevice();
export const useJoinRoom = () => {
  const history = useHistory();
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const { language, region, setLaunchConfig } = useContext(GlobalStoreContext);

  const joinRoomHandle = useCallback(
    async (params: JoinRoomParams, options: JoinRoomOptions = {}) => {
      const {
        role,
        roomType,
        roomName,
        userName,
        roomId,
        userId,
        roomServiceType,
        token,
        appId,
        language,
        region,
        duration = 30,
        platform = defaultPlatform,
      } = params;

      if (platform === Platform.H5) {
        const checkResult = h5ClassModeIsSupport(roomType);
        if (checkResult.status === Status.Failed) {
          return Promise.reject(checkResult);
        }
      }

      if (!userId) {
        return Promise.reject(failResult(ErrorCode.USER_ID_EMPTY));
      }

      if (!userName) {
        return Promise.reject(failResult(ErrorCode.USER_NAME_EMPTY));
      }

      const courseWareList = courseware.getList();

      const shareUrl = shareLinkInClass({ region, roomId, owner: userStore.nickName });

      console.log('## get rtm Token from demo server', token);

      const latencyLevel = getLatencyLevel(roomType, roomServiceType);

      const needPretest = needPreset(roomType, roomServiceType, role);
      const webRTCCodec = webRTCCodecH264.includes(roomServiceType) ? 'h264' : 'vp8';
      const config: GlobalLaunchOption = {
        appId: REACT_APP_AGORA_APP_ID || appId,
        sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
        pretest: needPretest,
        courseWareList: courseWareList.slice(0, 1),
        userUuid: userId,
        rtmToken: token,
        roomUuid: roomId,
        roomType: roomType,
        roomName: `${roomName}`,
        roomServiceType,
        userName: userName,
        roleType: role,
        region: region,
        language: language,
        duration: +duration * 60,
        latencyLevel,
        userFlexProperties: options.roomProperties || {},
        scenes: builderConfig.resource.scenes,
        themes: builderConfig.resource.themes,
        shareUrl,
        platform,
        mediaOptions: {
          web: {
            codec: webRTCCodec,
          },
        },
      };

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
      setLaunchConfig(config);
      history.push('/launch');
    },
    [],
  );

  const quickJoinRoom = useCallback(
    async (params: QuickJoinRoomParams) => {
      if (!builderConfig.ready) {
        return Promise.reject(failResult(ErrorCode.UI_CONFIG_NOT_READY));
      }

      const { roomId, role, nickName, userId, platform = defaultPlatform } = params;
      return roomStore.joinRoom({ roomId, role }).then((response) => {
        const { roomDetail, token, appId } = response.data.data;
        const { serviceType, ...rProps } = roomDetail.roomProperties;

        const checkResult = checkRoomInfoBeforeJoin(roomDetail);
        if (checkResult.status === Status.Failed) {
          return Promise.reject(checkResult);
        }

        return joinRoomHandle(
          {
            appId,
            token,
            role,
            platform,
            userId,
            userName: nickName,
            roomId: roomDetail.roomId,
            roomName: roomDetail.roomName,
            roomType: roomDetail.roomType,
            roomServiceType: serviceType,
            language,
            region,
          },
          { roomProperties: rProps },
        );
      });
    },
    [language, region, joinRoomHandle],
  );

  const quickJoinRoomNoAuth = useCallback(
    async (params: QuickJoinRoomParams) => {
      const { roomId, role, nickName, userId, platform = defaultPlatform } = params;
      return roomStore.joinRoomNoAuth({ roomId, role, userUuid: userId }).then((response) => {
        const { roomDetail, token, appId } = response.data.data;
        const { serviceType, ...rProps } = roomDetail.roomProperties;

        if (!builderConfig.ready) {
          return Promise.reject(failResult(ErrorCode.UI_CONFIG_NOT_READY));
        }

        const checkResult = checkRoomInfoBeforeJoin(roomDetail);
        if (checkResult.status === Status.Failed) {
          return Promise.reject(checkResult);
        }

        return joinRoomHandle(
          {
            appId,
            token,
            role,
            platform,
            userId,
            userName: nickName,
            roomId: roomDetail.roomId,
            roomName: roomDetail.roomName,
            roomType: roomDetail.roomType,
            roomServiceType: serviceType,
            language,
            region,
          },
          { roomProperties: rProps },
        );
      });
    },
    [language, region, joinRoomHandle],
  );

  return {
    joinRoomHandle,
    quickJoinRoom,
    quickJoinRoomNoAuth,
  };
};
