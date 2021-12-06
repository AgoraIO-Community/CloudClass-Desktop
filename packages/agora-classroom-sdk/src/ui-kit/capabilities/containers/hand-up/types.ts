import { BaseProps } from '~ui-kit/components/interface/base-props';

// export type HandsUpState = 'default' | 'actived';

// export type TeacherHandsUpState = HandsUpState;
// export type StudentHandsUpState = HandsUpState & 'forbidden';
export interface BaseWaveArmProps extends BaseProps {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export type UserWaveArmInfo = {
  userUuid: string;
  userName: string;
  onPodium: boolean;
};
