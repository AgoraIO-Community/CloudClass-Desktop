import classnames from 'classnames';
import { Icon } from '~components/icon';
import { Column, Profile } from '~components/roster';
import {getCameraState, getChatState, getMicrophoneState} from './base';

export const defaultColumns: Column[] = [
  {
    key: 'name',
    name: 'roster.student_name',
  },
  {
    key: 'onPodium',
    name: 'roster.student_co_video',
    action: 'podium',
    render: (_, profile, canOperate) => {
      const type =  !!profile.onPodium === true ? 'on-podium' : 'invite-to-podium';
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const podiumStatus= !!profile.onPodium === true ? 'icon-active' : 'un-active';
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${podiumStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate}/>
      );
    }
  },
  {
    key: 'whiteboardGranted',
    name: 'roster.granted',
    action: 'whiteboard',
    render: (_, profile, canOperate, role) => {
      const type =  role + '-' + (!!profile.whiteboardGranted === true ? 'authorized' : 'whiteboard');
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const whiteboardStatus = !!profile.whiteboardGranted === true ? 'icon-active' : 'un-active';
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${whiteboardStatus}`]: 1,
        ['icon-flex']: 1
      })
      return (
        <Icon type={type as any} className={cls} iconhover={canOperate} useSvg/>
      )
    },
  },
  {
    key: 'cameraEnabled',
    name: 'roster.camera_state',
    action: 'camera',
    render: (_, profile, canOperate) => {
      const {
        operateStatus,
        cameraStatus,
        type,
      } = getCameraState(profile, canOperate);
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${cameraStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate}/>
      )
    },
  },
  {
    key: 'micEnabled',
    name: 'roster.microphone_state',
    action: 'mic',
    render: (_, profile, canOperate) => {
      const {
        operateStatus,
        microphoneStatus,
        type,
      } = getMicrophoneState(profile, canOperate);
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${microphoneStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate}/>
      )
    },
  },
  {
    key: 'chat',
    name: 'roster.chat',
    action: 'chat',
    render: (text, profile: Profile, canOperate) => {
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
        <div className={cls}>
          <i className={chatStatus}></i>
        </div>
      )
    },
  },
  {
    key: 'stars',
    name: 'roster.reward',
    render: (text, profile: Profile, canOperate) => {
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const cls = classnames({
        [`${operateStatus}`]: 1,
      })
      return (
        <div>
          <Icon type={'star-outline'} className={cls} iconhover={canOperate}/>
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
    render: (_, profile, canOperate) => {
      const operateStatus = !!canOperate === true ? 'operate-status' : 'un-operate-status';
      const cls = classnames({
        [`${operateStatus}`]: 1,
      })
      return (
        <Icon type={'exit'} className={cls} iconhover={canOperate}/>
      )
    },
  },
];
