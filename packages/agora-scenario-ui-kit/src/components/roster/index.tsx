import { InteractionStateColors } from '~utilities/state-color';
import { SvgIconEnum } from '../svg-img';
import './index.css';

export { Roster } from './roster';

export { RosterTable, InfiniteScrollRosterTable } from './table';

export type Operation =
  | 'podium'
  | 'grant-board'
  | 'camera'
  | 'microphone'
  | 'kick'
  | 'chat'
  | 'star'
  | 'supervise-student';

export type Operations = Partial<Record<Operation, { interactable: boolean }>>;

export type SupportedFunction =
  | 'carousel'
  | 'search'
  | 'kick'
  | 'grant-board'
  | 'podium'
  | 'stars'
  | 'supervise-student';

export type ColumnKey =
  | 'name'
  | 'isOnPodium'
  | 'isBoardGranted'
  | 'isChatMuted'
  | 'cameraState'
  | 'microphoneState'
  | 'stars'
  | 'kick'
  | 'superviseStudent';

export type Column = {
  key: ColumnKey;
  order: number;
  name: string;
  render: (profile: Profile, hovered: boolean) => JSX.Element;
  operation?: Operation;
  width?: number | string;
};

export enum DeviceState {
  // published
  enabled,
  // unpublished
  disabled,
  // not on podium
  unavailable,
  // on podium but device is unauthorized
  unauthorized,
}

export const cameraIconType = {
  [DeviceState.enabled]: { icon: SvgIconEnum.CAMERA_ENABLED, color: InteractionStateColors.allow },
  [DeviceState.disabled]: {
    icon: SvgIconEnum.CAMERA_DISABLED, color: InteractionStateColors.half
  },
  [DeviceState.unavailable]: { icon: SvgIconEnum.CAMERA_DISABLED, color: InteractionStateColors.disabled },
  [DeviceState.unauthorized]: { icon: SvgIconEnum.CAMERA_DISABLED, color: InteractionStateColors.disabled },
};

export const microphoneIconType = {
  [DeviceState.enabled]: { icon: SvgIconEnum.MIC_ENABLED, color: InteractionStateColors.allow },
  [DeviceState.disabled]: {
    icon: SvgIconEnum.MIC_DISABLED, color: InteractionStateColors.half
  },
  [DeviceState.unavailable]: {
    icon: SvgIconEnum.MIC_DISABLED, color: InteractionStateColors.disabled
  },
  [DeviceState.unauthorized]: {
    icon: SvgIconEnum.MIC_DISABLED, color: InteractionStateColors.disabled
  }
}

export enum BoardGrantState {
  Disabled = 'board-grant-disabled',
  Granted = 'board-granted',
  NotGranted = 'board-not-granted',
}
export const BoardGrantIconType = {
  [BoardGrantState.Disabled]: { icon: SvgIconEnum.BOARD_NOT_GRANTED, color: InteractionStateColors.disabled },
  [BoardGrantState.Granted]: { icon: SvgIconEnum.BOARD_NOT_GRANTED, color: InteractionStateColors.allow },
  [BoardGrantState.NotGranted]: { icon: SvgIconEnum.BOARD_NOT_GRANTED, color: InteractionStateColors.half },
};
export type Profile = {
  uid: string | number;
  name: string;
  isOnPodium: boolean;
  boardGrantState: BoardGrantState;
  isChatMuted: boolean;
  cameraState: DeviceState;
  microphoneState: DeviceState;
  stars: number;
  operations: Operations;
};

export type CarouselProps = {
  times: string;
  isOpenCarousel: boolean;
  mode: string;
  randomValue: string;
  onTimesChange: (times: string, eventType: 'change' | 'blur') => void;
  onOpenCarousel: (isOpen: boolean) => void;
  onModeChange: (mode: string) => void;
  onRandomValueChange: (randomValue: string) => void;
};

export type RosterProps = {
  /**
   * 组件宽度
   */
  width?: number;
  /**
   * 房主姓名
   */
  hostname: string;
  /**
   * 轮播相关配置项
   */
  carouselProps: CarouselProps;
  /**
   * 可选功能
   */
  functions?: Array<SupportedFunction>;
  /**
   * 点击右上角关闭按钮
   */
  onClose: () => void;
  /**
   * 搜索关键字
   */
  keyword: string;
  /**
   * 关键字搜索变化
   */
  onKeywordChange: (evt: any) => void;
  /**
   * 标题
   */
  title?: string;

  /**
   * 拖动区域所在范围dom的class
   */
  bounds?: string;

  children?: React.ReactNode;
};
