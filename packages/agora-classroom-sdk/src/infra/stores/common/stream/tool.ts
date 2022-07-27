import { IconWithState } from '~ui-kit/components/util/type';

/**
 * 视频窗工具类型
 */
export enum EduStreamToolCategory {
  camera,
  microphone,
  whiteboard,
  podium,
  podium_all,
  star,
  stream_window_off,
}

/**
 * 视频窗工具对象
 */
export class EduStreamTool {
  iconType: IconWithState;
  hoverIconType?: IconWithState;
  interactable = false;
  toolTip: string;
  category: EduStreamToolCategory;
  onClick?: () => void;

  constructor(
    category: EduStreamToolCategory,
    iconType: IconWithState,
    toolTip: string,
    options?: {
      interactable?: boolean;
      onClick?: () => void;
      hoverIconType?: IconWithState;
    },
  ) {
    this.category = category;
    this.iconType = iconType;
    this.toolTip = toolTip;
    if (options) {
      options.hoverIconType && (this.hoverIconType = options.hoverIconType);
      options.interactable && (this.interactable = options.interactable);
      options.onClick && (this.onClick = options.onClick);
    }
  }
}
