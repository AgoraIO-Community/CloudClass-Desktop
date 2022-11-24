import MD5 from 'js-md5';

export type FetchImageResult = {
  width: number;
  height: number;
  file: File;
  uuid: string;
  url: string;
};

export type BaseImageSize = {
  width: number;
  height: number;
};

export const getImageSize = (imageInnerSize: BaseImageSize): BaseImageSize => {
  const windowSize: BaseImageSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
  const maxSize = 960;
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
