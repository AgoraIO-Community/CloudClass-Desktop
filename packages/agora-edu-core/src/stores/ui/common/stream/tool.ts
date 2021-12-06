export enum EduStreamToolCategory {
  camera,
  microphone,
  whiteboard,
  podium,
  podium_all,
  star,
}

export class EduStreamTool {
  iconType: string;
  style?: Record<string, string | number>;
  interactable: boolean = false;
  toolTip: string;
  category: EduStreamToolCategory;
  onClick?: () => void;

  constructor(
    category: EduStreamToolCategory,
    iconType: string,
    toolTip: string,
    options?: {
      style?: Record<string, string | number>;
      interactable?: boolean;
      onClick?: () => void;
    },
  ) {
    this.category = category;
    this.iconType = iconType;
    this.toolTip = toolTip;
    if (options) {
      options.style && (this.style = options.style);
      options.interactable && (this.interactable = options.interactable);
      options.onClick && (this.onClick = options.onClick);
    }
  }
}
