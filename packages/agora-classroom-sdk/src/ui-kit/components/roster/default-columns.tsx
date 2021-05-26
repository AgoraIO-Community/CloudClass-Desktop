import classnames from 'classnames';
import { getMediaIconProps, Icon, MediaIcon } from '~components/icon';
import { Column, Profile } from '~components/roster';
import {canOperate, getCameraState, getChatState, getMicrophoneState} from './base';

export const defaultColumns: Column[] = [
  {
    key: 'name',
    name: 'roster.student_name',
  },
  {
    key: 'onPodium',
    name: 'roster.student_co_video',
    action: 'podium',
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const type =  !!profile.onPodium === true ? 'on-podium' : 'invite-to-podium';
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const podiumStatus= !!profile.onPodium === true ? 'icon-active' : 'un-active';
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${podiumStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate} onClick={onClick}/>
      );
    }
  },
  {
    key: 'whiteboardGranted',
    name: 'roster.granted',
    action: 'whiteboard',
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const type =  userType + '-' + (!!profile.whiteboardGranted === true ? 'authorized' : 'whiteboard');
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const whiteboardStatus = !!profile.whiteboardGranted === true ? 'icon-active' : 'un-active';
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${whiteboardStatus}`]: 1,
        ['icon-flex']: 1
      })
      return (
        <Icon type={type as any} className={cls} iconhover={canOperate} useSvg size={22} onClick={onClick}/>
      )
    },
  },
  {
    key: 'cameraEnabled',
    name: 'roster.camera_state',
    action: 'camera',
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const {
        cameraEnabled,
        cameraDevice,
        online,
        onPodium,
        hasStream,
        isLocal,
        uid,
      } = profile
      return (
        <MediaIcon
          {...getMediaIconProps({
            muted: !!cameraEnabled,
            deviceState: cameraDevice,
            online: !!online,
            onPodium: onPodium,
            userType: userType,
            hasStream: !!hasStream,
            isLocal: isLocal,
            uid: uid,
            type: 'camera',
          })}
          onClick={() => onClick && onClick(uid)}
        />
      )
    },
  },
  {
    key: 'micEnabled',
    name: 'roster.microphone_state',
    action: 'mic',
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      
      const {
        micEnabled,
        micDevice,
        online,
        onPodium,
        hasStream,
        isLocal,
        uid,
      } = profile
      return (
        <MediaIcon
          {...getMediaIconProps({
            muted: !!micEnabled,
            deviceState: micDevice,
            online: !!online,
            onPodium: onPodium,
            userType: userType,
            hasStream: !!hasStream,
            isLocal: isLocal,
            uid: uid,
            type: 'microphone',
          })}
          onClick={() => onClick && onClick(uid)}
        />
      )
    },
  },
  {
    key: 'chat',
    name: 'roster.chat',
    action: 'chat',
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const {
        operateStatus,
        chatStatus,
        type,
      } = getChatState(profile, canOperate);
      const cls = classnames({
        ["icon-hover"]: canOperate,
        ["icon-disable"]: !canOperate,
        ["icon-flex"]: 1,
      })
      return (
        <div className={cls} onClick={onClick}>
          <i className={chatStatus}></i>
        </div>
      )
    },
  },
  {
    key: 'stars',
    name: 'roster.reward',
    render: (text: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const cls = classnames({
        [`${operateStatus}`]: 1,
      })
      return (
        <div>
          <Icon type={'star-outline'} className={cls} iconhover={canOperate} onClick={onClick}/>
          <span className="star-nums">&nbsp;x{text}</span>
        </div>
      )
    },
  },
  {
    key: 'kickOut',
    name: 'roster.kick',
    action: 'kickOut',
    visibleRoles: ['assistant', 'teacher'],
    render: (_: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => {
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const cls = classnames({
        [`${operateStatus}`]: 1,
      })
      return (
        <Icon type={'exit'} className={cls} iconhover={canOperate} onClick={onClick} />
      )
    },
  },
];
