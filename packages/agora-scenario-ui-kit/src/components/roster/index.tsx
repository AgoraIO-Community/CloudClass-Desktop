import './index.css';

export { Roster } from './roster';

export { RosterTable } from './table';

export type Operation = 'podium' | 'grant-board' | 'camera' | 'microphone' | 'kick' | 'chat';

export type SupportedFunction = 'carousel' | 'search' | 'kick' | 'grant-board' | 'podium' | 'stars';

export type ColumnKey =
  | 'name'
  | 'isOnPodium'
  | 'isBoardGranted'
  | 'isChatMuted'
  | 'cameraState'
  | 'microphoneState'
  | 'stars'
  | 'kick';

export type Column = {
  key: ColumnKey;
  order: number;
  name: string;
  render: (profile: Profile) => JSX.Element;
  operation?: Operation;
};

export enum DeviceState {
  enabled,
  disabled,
  unavailable,
}

export const cameraIconType = {
  [DeviceState.enabled]: 'camera',
  [DeviceState.disabled]: 'camera-off',
  [DeviceState.unavailable]: 'camera',
};

export const microphoneIconType = {
  [DeviceState.enabled]: 'microphone-on-outline',
  [DeviceState.disabled]: 'microphone-off-outline',
  [DeviceState.unavailable]: 'microphone-on-outline',
};

export type Profile = {
  uid: string | number;
  name: string;
  isOnPodium: boolean;
  isBoardGranted: boolean;
  isChatMuted: boolean;
  cameraState: DeviceState;
  microphoneState: DeviceState;
  stars: number;
  operations: Operation[];
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
   * 是否可拖拽
   */
  isDraggable?: boolean;
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

  /**
   * 组件拖动顶部的初始偏移量
   */
  offsetTop?: number;
};
