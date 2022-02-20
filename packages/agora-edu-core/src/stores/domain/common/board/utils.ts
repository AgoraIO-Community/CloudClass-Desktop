import { FetchImageResult, BaseImageSize, Identity } from '../../../../type';
import MD5 from 'js-md5';
import { WhiteboardTool } from './type';
import { ApplianceNames, JoinRoomParams, ViewMode } from 'white-web-sdk';
import { EduRoleTypeEnum } from '../../../..';

export const convertAGToolToWhiteTool = (tool: WhiteboardTool): ApplianceNames | undefined => {
  switch (tool) {
    case WhiteboardTool.pen:
      return ApplianceNames.pencil;
    case WhiteboardTool.rectangle:
      return ApplianceNames.rectangle;
    case WhiteboardTool.ellipse:
      return ApplianceNames.ellipse;
    case WhiteboardTool.straight:
      return ApplianceNames.straight;
    case WhiteboardTool.selector:
      return ApplianceNames.selector;
    case WhiteboardTool.text:
      return ApplianceNames.text;
    case WhiteboardTool.hand:
      return ApplianceNames.hand;
    case WhiteboardTool.eraser:
      return ApplianceNames.eraser;
    case WhiteboardTool.clicker:
      return ApplianceNames.clicker;
    case WhiteboardTool.laserPointer:
      return ApplianceNames.laserPointer;
    case WhiteboardTool.arrow:
      return ApplianceNames.arrow;
    case WhiteboardTool.pentagram:
    case WhiteboardTool.rhombus:
    case WhiteboardTool.triangle:
      return ApplianceNames.shape;
    default:
      return undefined;
  }
};

export const getImageSize = (imageInnerSize: BaseImageSize): BaseImageSize => {
  const windowSize: BaseImageSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
  const maxSize: number = 960;
  if (
    (imageInnerSize.width > maxSize && windowSize.width > maxSize) ||
    (imageInnerSize.height > maxSize && windowSize.height > maxSize)
  ) {
    if (widthHeightProportion > 1) {
      return {
        width: maxSize,
        height: maxSize / widthHeightProportion,
      };
    } else {
      return {
        width: maxSize * widthHeightProportion,
        height: maxSize,
      };
    }
  } else {
    if (imageInnerSize.width > windowSize.width || imageInnerSize.height > windowSize.height) {
      if (widthHeightProportion > 1) {
        return {
          width: windowSize.width,
          height: windowSize.width / widthHeightProportion,
        };
      } else {
        return {
          width: windowSize.height * widthHeightProportion,
          height: windowSize.height,
        };
      }
    } else {
      return {
        width: imageInnerSize.width,
        height: imageInnerSize.height,
      };
    }
  }
};

export const fetchNetlessImageByUrl = async (url: string): Promise<FetchImageResult> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const contentType = blob.type;
    const image = new Image();
    const reader = new FileReader();
    const file = new File([blob], url, { type: contentType });
    const result = await new Promise((resolve) => {
      reader.readAsDataURL(blob);
      reader.onload = () => {
        image.addEventListener(
          'load',
          () => {
            const uuid = MD5(reader.result!);
            const res = getImageSize(image);
            const result = {
              width: res.width,
              height: res.height,
              file: file,
              url,
              uuid,
            };
            resolve(result);
          },
          false,
        );
        image.src = reader.result as string;
      };
    });
    return result as FetchImageResult;
  } catch (err) {
    throw err;
  }
};

export const rgbToHexColor = (r: number, g: number, b: number): string => {
  const computeToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length == 1 ? `0${hex}` : hex;
  };

  return `#${computeToHex(r)}${computeToHex(g)}${computeToHex(b)}`;
};

/**
 * Mimetypes
 *
 * @see http://hul.harvard.edu/ois/////systems/wax/wax-public-help/mimetypes.htm
 * @typedef Mimetypes~Kind
 * @enum
 */
export const MimeTypesKind: Record<string, string> = {
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

export const testPpt = {
  isActive: true,
  id: 'h552a9de739e5b849715ac1d37ccbd7fa61',
  name: 'test课件',
  ext: 'pptx',
  type: 'ppt',
  size: '- -',
  taskUuid: '3361daf0d28011ebae6f1dc0589306eb',
  taskProgress: {
    totalPageSize: 3,
    convertedPageSize: 3,
    convertedPercentage: 100,
    convertedFileList: [],
  },
  url: 'https://agora-apaas.oss-accelerate.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/mjwrihugyrew4/06546e948fe67f6bf7b161cf5afa4103',
  convertedPercentage: 0,
  updateTime: 1623743516439,
  scenes: [
    {
      name: '1',
      ppt: {
        src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/1.slide',
        width: 1280,
        height: 720,
        preview: '',
      },
    },
    {
      name: '2',
      ppt: {
        src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/2.slide',
        width: 1280,
        height: 720,
        preview: '',
      },
    },
    {
      name: '3',
      ppt: {
        src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/3.slide',
        width: 1280,
        height: 720,
        preview: '',
      },
    },
  ],
  access: 'public',
  progress: 100,
  status: 'cached',
};

export const getJoinRoomParams = (
  role: EduRoleTypeEnum,
): Partial<JoinRoomParams> & { identity: Identity; viewMode: ViewMode } => {
  if (role === EduRoleTypeEnum.teacher || role === EduRoleTypeEnum.assistant) {
    return {
      identity: Identity.host,
      isWritable: true,
      disableCameraTransform: true,
      disableDeviceInputs: false,
      viewMode: ViewMode.Broadcaster,
    };
  }

  return {
    identity: Identity.guest,
    isWritable: false,
    disableCameraTransform: true,
    disableDeviceInputs: true,
    viewMode: ViewMode.Follower,
  };
};
