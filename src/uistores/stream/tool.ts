import { IconWithState } from '@classroom/ui-kit/components/util/type';
import { EduStream } from 'agora-edu-core';
import { AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { CameraPlaceholderType } from './struct';

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

export const getCameraPlaceholder = (stream: EduStream) => {
  const videoSourceState = stream.videoSourceState;

  let placeholder = CameraPlaceholderType.none;

  const deviceDisabled = videoSourceState === AgoraRteMediaSourceState.stopped;

  if (deviceDisabled) {
    return CameraPlaceholderType.disabled;
  }

  if (
    stream.videoState === AgoraRteMediaPublishState.Published &&
    videoSourceState === AgoraRteMediaSourceState.started
  ) {
    placeholder = CameraPlaceholderType.none;
  } else {
    placeholder = CameraPlaceholderType.muted;
  }
  return placeholder;
};
