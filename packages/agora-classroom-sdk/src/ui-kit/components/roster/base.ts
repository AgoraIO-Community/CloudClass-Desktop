import { IconTypes } from "../icon/icon-types"
import { Profile } from '~components/roster';
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

const listSort = (list: Array<Profile>) => {
  list.sort(function(a, b) {
    const nameA = a.name
    const nameB = b.name
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })
}

export const studentListSort = (list: Array<Profile>) => {
  if(list.length === 0) {
    return
  }
  // 台上学生 台下学生 
  const onStage: Array<Profile> = list.filter((item: Profile) => item.onPodium)
  const offStage: Array<Profile> = list.filter((item: Profile) => !item.onPodium)

  // 首字符为数字过滤
  let onStageNum: Array<Profile> = onStage.filter((item: any) => {
    let character: string = item.name.slice(0, 1)
    return '0123456789'.includes(character)
  })
  listSort(onStageNum)

  let onStageOther: Array<Profile> = onStage.filter((item: any) => {
    let character: string = item.name.slice(0, 1)
    return !'0123456789'.includes(character)
  })
  onStageOther.forEach((e: Profile) => shfitPinyin(e.name))
  listSort(onStageOther)

  let offStageNum: Array<Profile> = offStage.filter((item: any) => {
    let character: string = item.name.slice(0, 1)
    return '0123456789'.includes(character)
  })
  listSort(offStageNum)

  let offStageOther: Array<Profile> = offStage.filter((item: any) => {
    let character: string = item.name.slice(0, 1)
    return !'0123456789'.includes(character)
  })
  offStageOther.forEach((e: Profile) => shfitPinyin(e.name))
  listSort(offStageOther)

  return onStageOther.concat(onStageNum, offStageOther, offStageNum)
}