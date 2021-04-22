import { IconTypes } from "../icon/icon-types"

export type ProfileRole = 'student' | 'teacher' | 'assistant' | 'invisible'

export const canOperate = (role: ProfileRole, localUid: string, data: any, col: any): boolean => {
  //任何角色的星星不可点击
  if(col.key === 'stars'){
    return false;
  }

  if (['assistant', 'teacher'].includes(role)) {
    //授权上台、白板、离开始终可点击
    if(['onPodium', 'whiteboardGranted', 'kickOut'].includes(col.key)){
      return true;
    }
    //摄像头、麦克风 当该用户上台时可点击，下台时不可点击
    if(data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)){
      return true;
    }
    return false;
  }
  
  if (role === 'student' && localUid === data.uid) {
    //学生自己上台时 摄像头与麦克风可点击
    if (data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)) {
      return true
    }
    return false
  }
  return false
}

export const getCameraState = (profile: any, canOperate: boolean) => {
  const defaultType = 'camera-off'
  const type = !!profile.cameraEnabled === true ? 'camera' : defaultType

  const operateStatus = canOperate ? 'operate-status' : 'un-operate-status';
  const cameraStatus = !!profile.cameraEnabled === true ? 'icon-active' : 'media-un-active';
  return {
    type: type as IconTypes,
    operateStatus: operateStatus,
    cameraStatus: cameraStatus
  }
}

export const getMicrophoneState = (profile: any, canOperate: boolean) => {
  const defaultType = 'microphone-off-outline'
  const type = !!profile.micEnabled === true ? 'microphone-on-outline' : defaultType

  const operateStatus = canOperate ? 'operate-status' : 'un-operate-status';
  const microphoneStatus = !!profile.micEnabled === true ? 'icon-active' : 'media-un-active';
  return {
    type: type as IconTypes,
    operateStatus: operateStatus,
    microphoneStatus: microphoneStatus
  }
}