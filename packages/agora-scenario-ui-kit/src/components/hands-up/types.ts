import { BaseProps } from "~components/interface/base-props"

export type HandsUpState =
| 'default'
| 'received'
| 'stalled'
| 'active'


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