import { IconTypes } from "../icon/icon-types"

export type ProfileRole = 'student' | 'teacher' | 'assistant' | 'invisible'

export const canOperate = (role: ProfileRole, localUid: string, data: Profile, col: Column): boolean => {
  if (['assistant', 'teacher'].includes(role)) {
    return true
  }

  if (role === 'student' && localUid === data.uid) {
    // only onPodium is true, student can control self media device
    if (data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)) {
      return true
    }
    return false
  }

  return false
}

export const canHover = (role: ProfileRole, localUid: string, data: Profile, col: Column): boolean => {
  if (['assistant', 'teacher'].includes(role)) {
    return true
  }
  if (role === 'student' && localUid === data.uid) {
    if (data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)) {
      return true
    }
    return false
  }
  return false
}


export const getCameraState = (profile: any) => {
  const defaultType = 'camera-off'
  // const hover = !!profile.onlineState || profile.disabled === false || !!profile.cameraDevice === true 

  const type = !!profile.cameraEnabled === true ? 'camera' : defaultType

  const className = !!profile.cameraEnabled === true ? 'un-muted' : 'muted'

  return {
    type: type as IconTypes,
    className: className
  }
}

export const getMicrophoneState = (profile: any): any => {
  const defaultType = 'microphone-off-outline'

  const type = !!profile.micEnabled === true ? 'microphone-on-outline' : defaultType

  const className = !!profile.micEnabled === true ? 'un-muted' : 'muted'

  return {
    type: type as IconTypes,
    className: className
  }
}