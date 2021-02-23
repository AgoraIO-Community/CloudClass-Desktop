import { AgoraMediaDeviceEnum } from "@/types/global"
import MD5 from "js-md5"
import { Room } from "white-web-sdk"
import { GlobalStorage } from "./custom-storage"

export const debounce = function(foo:any, t:number) {
  let timer:any
  return function() {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      // @ts-ignore
      foo.apply(this, arguments)              
    }, t)  
  }
}

export type BaseImageSize = {
  width: number,
  height: number,
}

export type NetlessImageFile = {
  uuid: string,
  width: number,
  height: number,
  file: File,
  url: string,
  coordinateX: number,
  coordinateY: number,
}

export const getImageSize = (imageInnerSize: BaseImageSize): BaseImageSize => {
  const windowSize: BaseImageSize = {width: window.innerWidth, height: window.innerHeight};
  const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
  const maxSize: number = 960;
  if ((imageInnerSize.width > maxSize && windowSize.width > maxSize) || (imageInnerSize.height > maxSize && windowSize.height > maxSize)) {
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
}

export type FetchImageResult = {
  width: number, 
  height: number,
  file: File,
  uuid: string,
  url: string
}

export const fetchNetlessImageByUrl = async (url: string): Promise<FetchImageResult> => {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const contentType = blob.type
    const image = new Image()
    const reader = new FileReader()
    const file = new File([blob], url, {type: contentType})
    const result = await new Promise((resolve) => {
      reader.readAsDataURL(blob)
        reader.onload = () => {
          image.addEventListener('load', () => {
            const uuid = MD5(reader.result)
            const res = getImageSize(image)
            const result = {
              width: res.width,
              height: res.height,
              file: file,
              url,
              uuid
            }
            resolve(result)
          }, false)
          image.src = reader.result as string;
        }
      })
    return result as FetchImageResult
  } catch (err) {
    throw err
  }

}

export const netlessInsertImageOperation = async (room: Room, imageFile: NetlessImageFile) => {
  const {x, y} = await room.convertToPointInWorld({x: imageFile.coordinateX, y: imageFile.coordinateY})
  room.insertImage({
    uuid: imageFile.uuid,
    centerX: x,
    centerY: y,
    width: imageFile.width,
    height: imageFile.height,
    locked: false
  })
  room.completeImageUpload(imageFile.uuid, imageFile.url)
}

export type NetlessMediaFile = {
  url: string,
  originX: number,
  originY: number,
  width: number,
  height: number,
}

export const netlessInsertVideoOperation = (room: Room, file: NetlessMediaFile) => {
  room.insertPlugin(
    'video',
    {
      originX: file.originX,
      originY: file.originY,
      width: file.width,
      height: file.height,
      attributes: {
          pluginVideoUrl: file.url
          // isNavigationDisable: false
      }
    }
  )
}

export const netlessInsertAudioOperation = (room: Room, file: NetlessMediaFile) => {
  room.insertPlugin(
    'audio',
    {
      originX: file.originX,
      originY: file.originY,
      width: file.width,
      height: file.height,
      attributes: {
          pluginAudioUrl: file.url
          // isNavigationDisable: false
      }
    }
  )
}

// media device helper
export const getDeviceLabelFromStorage = (type: string) => {
  const mediaDeviceStorage = GlobalStorage.read("mediaDevice") || {}

  if (!['cameraLabel', 'microphoneLabel'].includes(type)) {
    return AgoraMediaDeviceEnum.Default
  }
  return mediaDeviceStorage[type]
}