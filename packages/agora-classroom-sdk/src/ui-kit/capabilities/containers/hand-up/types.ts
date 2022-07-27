import { BaseProps } from '~ui-kit/components/util/type';

export interface BaseWaveArmProps extends BaseProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  isH5?: boolean;
  isOnPodium?: boolean;
  onOffPodium?: () => void;
}

export type UserWaveArmInfo = {
  userUuid: string;
  userName: string;
  onPodium: boolean;
};
