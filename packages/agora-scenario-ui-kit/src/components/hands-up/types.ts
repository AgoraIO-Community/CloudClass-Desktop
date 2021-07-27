import { BaseProps } from "~components/interface/base-props"

export type HandsUpState =
| 'default'
| 'actived'

export type TeacherHandsUpState = HandsUpState
export type StudentHandsUpState = HandsUpState & 'forbidden'
export interface BaseHandsUpProps extends BaseProps {
width?: number;
height?: number;
borderRadius?: number;
}


export type StudentInfo = {
  userUuid: string,
  userName: string,
  coVideo: boolean
}

export type HandsStudentInfo = {
  userUuid: string,
  userName: string,
  coVideo: boolean,
  hands: boolean
}