import { EduGroupDetail } from './struct';

// 是否开启分组 1开启 0不开启
export enum GroupState {
  OPEN = 1,
  CLOSE = 0,
}

export type GroupDetails = Record<string, EduGroupDetail>;
