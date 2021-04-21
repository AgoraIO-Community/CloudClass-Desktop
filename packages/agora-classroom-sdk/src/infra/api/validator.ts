import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { isBoolean, isEmpty, isString, isFunction, isNumber, isArray } from 'lodash';
import { AgoraEduSDKConfigParams } from "./declare"
import { ReplayOption, LaunchOption, DiskOption, OpenDiskOption } from "./index"

const pattern = /^[0-9a-zA-Z!#$%&()+-:;<=.>?@[\]^_{}|~,]+$/

export class AgoraSDKError extends Error {

  message: string
  code?: string

  constructor(args: any | string) {
    super(args)
    if (typeof args === 'string') {
      this.message = args
    } else {
      this.message = args.message
      this.code = args.code
    }
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "string") {
      return `SDKError: ${JSON.stringify({
        name: this.name,
        code: this.code,
        message: this.message,
        stack: this.stack
      })}`
    }
  }
}

export const checkLaunchOption = (dom: Element, option: LaunchOption) => {
  if (!dom) {
    throw new AgoraSDKError('dom parameter cannot be empty')
  }

  if (isEmpty(option)) {
    throw new AgoraSDKError('option parameter cannot is invalid')
  }

  if (!isBoolean(option.pretest)) {
    throw new AgoraSDKError('pretest parameter is invalid should be boolean')
  }

  if (!isNumber(option.roleType)) {
    throw new AgoraSDKError('roleType parameter is invalid should be number')
  }

  if (!isNumber(option.roomType)) {
    throw new AgoraSDKError('roomType parameter is invalid should be number')
  }

  if (!isString(option.roomName)) {
    throw new AgoraSDKError('roomName parameter is invalid should be string')
  }

  if (!isString(option.roomUuid)) {
    throw new AgoraSDKError('roomUuid parameter is invalid should be string')
  }

  if (!isString(option.userName)) {
    throw new AgoraSDKError('userName parameter is invalid should be string')
  }

  if (!isString(option.userUuid)) {
    throw new AgoraSDKError('userUuid parameter is invalid should be string')
  }

  if (!isString(option.language)) {
    throw new AgoraSDKError('language parameter should be string')
  }

  if (!['zh', 'en'].includes(option.language)) {
    throw new AgoraSDKError(`${option.language} language is not supported`)
  }

  if (!option.listener) {
    throw new AgoraSDKError('listener parameter is invalid cannot be empty')
  }

  if (!isFunction(option.listener)) {
    throw new AgoraSDKError('listener parameter should be a function')
  }

  if (![EduRoleTypeEnum.invisible, EduRoleTypeEnum.assistant, EduRoleTypeEnum.student, EduRoleTypeEnum.teacher].includes(option.roleType)) {
    throw new AgoraSDKError(`${option.roleType}, roleType parameter is invalid`)
  }

  if (![0, 2, 4].includes(option.roomType)) {
    throw new AgoraSDKError(`${option.roomType}, roomType parameter is invalid`)
  }

  if (isEmpty(option.roomName)) {
    throw new AgoraSDKError('roomName parameter cannot be empty')
  }

  if (isEmpty(option.roomUuid)) {
    throw new AgoraSDKError('roomUuid parameter cannot be empty')
  }

  if (isEmpty(option.userName)) {
    throw new AgoraSDKError('userName parameter cannot be empty')
  }

  if (isEmpty(option.userUuid)) {
    throw new AgoraSDKError('userUuid parameter cannot be empty')
  }

  if (!isArray(option.courseWareList)) {
    throw new AgoraSDKError('courseWareList parameter should be valid array')
  }

  if (option.personalCourseWareList && !isArray(option.personalCourseWareList)) {
    throw new AgoraSDKError('personalCourseWareList parameter should be valid array')
  }

  // if (option.userUuid && option.userUuid.length > 89) {
  //   throw new AgoraSDKError('userUuid parameter cannot be empty')
  // }

  // if (option.roomUuid && option.roomUuid.length > 89) {
  //   throw new AgoraSDKError('userUuid parameter cannot be empty')
  // }

  if (!pattern.test(option.userUuid)) {
    throw new AgoraSDKError('userUuid parameter is invalid')
  }

  if (!pattern.test(option.roomUuid)) {
    throw new AgoraSDKError('roomUuid parameter is invalid')
  }
}

export const checkDiskOption = (dom: Element, option: OpenDiskOption) => {
  if (!dom) {
    throw new AgoraSDKError('dom parameter cannot be empty')
  }
  
  if (isEmpty(option)) {
    throw new AgoraSDKError('option parameter cannot be empty')
  }

  if (!isFunction(option.listener)) {
    throw new AgoraSDKError('listener parameter should be function')
  }

  if (!isArray(option.courseWareList)) {
    throw new AgoraSDKError('courseWareList parameter should be valid array')
  }
}


export const checkReplayOption = (dom:Element, option: ReplayOption) => {

  if (!dom) {
    throw new AgoraSDKError('dom parameter cannot be empty')
  }
  
  if (isEmpty(option)) {
    throw new AgoraSDKError('option parameter cannot be empty')
  }

  if (!isString(option.whiteboardAppId)) {
    throw new AgoraSDKError('whiteboardAppId parameter should be string')
  }

  if (!isFunction(option.listener)) {
    throw new AgoraSDKError('listener parameter should be function')
  }

  if (!isString(option.whiteboardAppId)) {
    throw new AgoraSDKError('whiteboardAppId parameter should be string')
  }

  if (!isString(option.whiteboardId)) {
    throw new AgoraSDKError('whiteboardId parameter should be string')
  }

  if (!isString(option.whiteboardToken)) {
    throw new AgoraSDKError('whiteboardToken parameter should be string')
  }

  if (!isString(option.language)) {
    throw new AgoraSDKError('language parameter should be string')
  }

  if (!['zh', 'en'].includes(option.language)) {
    throw new AgoraSDKError(`${option.language} language is not supported`)
  }

  if (isEmpty(option.beginTime)) {
    throw new AgoraSDKError('beginTime parameter cannot be empty')
  }

  if (isEmpty(option.endTime)) {
    throw new AgoraSDKError('endTime parameter cannot be empty')
  }

  if (isEmpty(option.videoUrl)) {
    throw new AgoraSDKError('videoUrl parameter cannot be empty')
  }

  if (isEmpty(option.listener)) {
    throw new AgoraSDKError('listener parameter cannot be empty')
  }

  // time valid check
  if (option.beginTime > option.endTime) {
    throw new AgoraSDKError(`beginTime parameter shouldn't greater than endTime parameter`)
  }
}

export const checkConfigParams = (params: AgoraEduSDKConfigParams) => {
  if (isEmpty(params)) {
    throw new AgoraSDKError('config parameter cannot be empty')
  }
  
  if (isEmpty(params.appId)) {
    throw new AgoraSDKError('appId parameter cannot be empty')
  }
  if (params.appId.length !== 32) {
    throw new AgoraSDKError('appId parameter is invalid')
  }
}

export const checkDiskParams = (dom: Element, params?: DiskOption) => {
  if (!dom) {
    throw new AgoraSDKError("dom is empty")
  }
  // if (isEmpty(params)) {
  //   throw new AgoraSDKError('disk config parameter cannot be empty')
  // }
}