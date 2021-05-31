import { IconTypes } from "../icon/icon-types"
import { Profile } from '~components/roster';
import { StudentRosterProfile } from '~components/roster/user-list'
const pinyinlite = require('pinyinlite/index_common');

export type ProfileRole = 'student' | 'teacher' | 'assistant' | 'invisible'

export const canOperate = (role: any, localUid: string, data: any, col: any): boolean => {
  //任何角色的星星不可点击
  if(col.key === 'stars'){
    return false;
  }

  if (['assistant', 'teacher'].includes(role)) {
    //授权上台、白板、离开始终可点击
    if(['onPodium', 'whiteboardGranted', 'kickOut', 'chat'].includes(col.key)){
      return true;
    }
    //摄像头、麦克风 当该用户上台时可点击，下台时不可点击
    if(data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)){
      if (col.key === 'cameraEnabled') {
        return data.cameraDevice === 1
      }
      if (col.key === 'micEnabled') {
        return data.micDevice === 1
      }
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

export const getChatState = (profile: any, canOperate: boolean) => {
  const defaultType = 'message-off'
  const type = !!profile.chatEnabled === true ? 'message-on' : defaultType

  const operateStatus = canOperate ? 'operate-status' : 'un-operate-status';
  let chatStatus = !!profile.chatEnabled === true ? 'can-discussion-svg' : 'no-discussion-svg';
  if (!canOperate) {
    const studentIconClass = {
      'can-discussion-svg': 'stu-can-discussion-svg',
      'no-discussion-svg': 'stu-no-discussion-svg',
    }
    chatStatus = studentIconClass[chatStatus]
  }
  return {
    type: type as IconTypes,
    operateStatus: operateStatus,
    chatStatus: chatStatus
  }
}

export const getCameraState = (profile: any, canOperate: boolean) => {
  const defaultType = 'camera-off'
  const types: Record<string, string> = {
    'true': 'camera',
    'false': 'camera-off'
  }

  const device = +profile.cameraDevice
  const type = types[profile.cameraEnabled] ?? defaultType

  const operateStatus = canOperate ? 'operate-status' : 'un-operate-status';
  const deviceStatus = {
    0: {
      'active': '',
      'inactive': '',
    },
    1: {
      'active': 'icon-active',
      'inactive': 'media-un-active',
    },
    2: {
      'active': '',
      'inactive': '',
    },
  }
  const deviceMap = deviceStatus[device]
  const cameraStatus = profile.cameraEnabled ? deviceMap['active'] : deviceMap['inactive'];
  return {
    type: type as IconTypes,
    operateStatus: operateStatus,
    cameraStatus: cameraStatus
  }
}

export const getMicrophoneState = (profile: any, canOperate: boolean) => {
  const defaultType = 'microphone-off-outline'
  const types: Record<string, string> = {
    'true': 'microphone-on-outline',
    'false': 'microphone-off-outline'
  }

  const device = +profile.micDevice
  const type = types[profile.micEnabled] ?? defaultType

  const operateStatus = canOperate ? 'operate-status' : 'un-operate-status';
  const deviceStatus = {
    0: {
      'active': '',
      'inactive': '',
    },
    1: {
      'active': 'icon-active',
      'inactive': 'media-un-active',
    },
    2: {
      'active': '',
      'inactive': '',
    },
  }
  const deviceMap = deviceStatus[device]
  const microphoneStatus = profile.micEnabled ? deviceMap['active'] : deviceMap['inactive'];
  return {
    type: type as IconTypes,
    operateStatus: operateStatus,
    microphoneStatus: microphoneStatus
  }
}

const shfitPinyin = (str: string) => {
  const pattern = new RegExp("[\u4E00-\u9FA5]+") 
  if(pattern.test(str)) {
    return pinyinlite(str)
  }
  return str
}

interface PublicProfile {
  name: string
  onPodium: boolean
}

export const studentListSort = <T extends PublicProfile >(list: Array<T>): Array<T> => {
  if(list.length === 0) {
    return []
  }
  // 对数组进行浅拷贝，并将名字中所有中文名转拼音 命名为 pinyinName 等待排序
  const students = list.map((item: T) => {
    return {
      ...item,
      pinyinName: shfitPinyin(item.name) 
    }
  })
  const isNumber = (str: string) => {
    return '0123456789'.includes(str)
  }
  students.sort((current: any, next: any) => {
    // 上台的在前面
    if(current.onPodium !== next.onPodium) {
      return current.onPodium? -1 : 1
    }
    // 首字符是否为数字
    const currentFirst = current.pinyinName[0]
    const nextFirst = next.pinyinName[0]
    if(isNumber(currentFirst) !== isNumber(nextFirst)) {
      return !isNumber(currentFirst)? -1 : 1
    }
    return current.pinyinName < next.pinyinName ? -1 : 1
  })
  return students
}