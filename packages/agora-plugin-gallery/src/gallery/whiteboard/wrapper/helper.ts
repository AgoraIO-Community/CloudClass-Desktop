import { ApplianceNames, ShapeType } from 'white-web-sdk';
import { FcrBoardTool, FcrBoardShape } from '@/infra/protocol/type';

export const textColors = [
  '#ffffff',
  '#9b9b9b',
  '#4a4a4a',
  '#000000',
  '#d0021b',
  '#f5a623',
  '#f8e71c',
  '#7ed321',
  '#9013fe',
  '#50e3c2',
  '#0073ff',
  '#ffc8e2',
];

export const defaultTool = FcrBoardTool.Clicker;
export const defaultStrokeColor = { r: 0, g: 115, b: 255 };
export const defaultTextSize = 24;

export const mediaMimeTypes: Record<string, string> = {
  opus: 'video/ogg',
  ogv: 'video/ogg',
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  mkv: 'video/x-matroska',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  caf: 'audio/x-caf',
  flac: 'audio/flac',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export const convertToNetlessBoardTool = (tool: FcrBoardTool) => {
  switch (tool) {
    case FcrBoardTool.Selector:
      return ApplianceNames.selector;
    case FcrBoardTool.Eraser:
      return ApplianceNames.eraser;
    case FcrBoardTool.LaserPointer:
      return ApplianceNames.laserPointer;
    case FcrBoardTool.Clicker:
      return ApplianceNames.clicker;
    case FcrBoardTool.Hand:
      return ApplianceNames.hand;
    case FcrBoardTool.Text:
      return ApplianceNames.text;
  }
};

export const convertToNetlessBoardShape = (shape: FcrBoardShape) => {
  switch (shape) {
    case FcrBoardShape.Triangle:
      return [ApplianceNames.shape, ShapeType.Triangle];
    case FcrBoardShape.Pentagram:
      return [ApplianceNames.shape, ShapeType.Pentagram];
    case FcrBoardShape.Rhombus:
      return [ApplianceNames.shape, ShapeType.Rhombus];
    case FcrBoardShape.Rectangle:
      return [ApplianceNames.rectangle];
    case FcrBoardShape.Ellipse:
      return [ApplianceNames.ellipse];
    case FcrBoardShape.Straight:
      return [ApplianceNames.straight];
    case FcrBoardShape.Arrow:
      return [ApplianceNames.arrow];
    case FcrBoardShape.Curve:
      return [ApplianceNames.pencil];
    default:
      return [];
  }
};

export const convertToFcrBoardToolShape = (tool?: ApplianceNames, shape?: ShapeType) => {
  switch (tool) {
    case ApplianceNames.selector:
      return [FcrBoardTool.Selector];
    case ApplianceNames.eraser:
      return [FcrBoardTool.Eraser];
    case ApplianceNames.laserPointer:
      return [FcrBoardTool.LaserPointer];
    case ApplianceNames.text:
      return [FcrBoardTool.Text];
  }
  switch (`${tool || ''}${shape || ''}`) {
    case `${ApplianceNames.rectangle}`:
      return [, FcrBoardShape.Rectangle];
    case `${ApplianceNames.ellipse}`:
      return [, FcrBoardShape.Ellipse];
    case `${ApplianceNames.straight}`:
      return [, FcrBoardShape.Straight];
    case `${ApplianceNames.arrow}`:
      return [, FcrBoardShape.Arrow];
    case `${ApplianceNames.pencil}`:
      return [, FcrBoardShape.Curve];
    case `${ApplianceNames.shape}${ShapeType.Triangle}`:
      return [, FcrBoardShape.Triangle];
    case `${(ApplianceNames.shape, ShapeType.Pentagram)}`:
      return [, FcrBoardShape.Pentagram];
    case `${ApplianceNames.shape}${ShapeType.Rhombus}`:
      return [, FcrBoardShape.Rhombus];
  }

  return [];
};

export const hexColorToWhiteboardColor = (val: string): number[] => {
  const pattern = /^(#?)[a-fA-F0-9]{6}$/; // 16进制颜色校验规则
  if (!pattern.test(val)) {
    return [255, 255, 255];
  }
  const v = val.replace(/#/, '');
  const rgbArr = [];
  for (let i = 0; i < 3; i++) {
    const item = v.substring(i * 2, i * 2 + 2);
    const num = parseInt(item, 16);
    rgbArr.push(num);
  }
  return rgbArr;
};

export const src2DataURL = (src: string) => {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.onload = () => {
      canvas.setAttribute('width', `${image.width}`);
      canvas.setAttribute('height', `${image.height}`);
      ctx?.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8) as string);
    };
    image.onerror = () => {
      reject('error');
    };
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
};
