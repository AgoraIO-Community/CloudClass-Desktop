import { IconTypes } from "../icon/icon-types"
import { Profile } from '~components/roster';
import { StudentRosterProfile } from '~components/roster/user-list'
const pinyin = require("pinyin");

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

const shfitPinyin = (str: string) => {
  const pattern = new RegExp("[\u4E00-\u9FA5]+") 
  if(pattern.test(str)) {
    return pinyin(str, {
      style: pinyin.STYLE_NORMAL, // 不带声调
    })
  }
  return str
}

export const studentListSort = (list: Array<Profile>) => {
  if(list.length === 0) {
    return
  }
  // 对数组进行浅拷贝，并将名字中所有中文名转拼音 等待排序
  const students = list.map((item: Profile) => {
    return {
      ...item,
      name: shfitPinyin(item.name)
    }
  })
  const isNumber = (str: string) => {
    return '0123456789'.includes(str)
  }
  students.sort((current: Profile, next: Profile) => {
    // 上台的在前面
    if(current.onPodium !== next.onPodium) {
      return current.onPodium? -1 : 1
    }
    // 首字符是否为数字
    const currentFirst = current.name[0]
    const nextFirst = next.name[0]
    if(isNumber(currentFirst) !== isNumber(nextFirst)) {
      return !isNumber(currentFirst)? -1 : 1
    }
    return current.name < next.name ? -1 : 1
  })
  return students
}