import { AgoraMediaDeviceEnum } from "@/types/global"
import fetchProgress from "@netless/fetch-progress"
import { EduRoleTypeEnum, EduTextMessage } from "agora-rte-sdk"
import MD5 from "js-md5"
import { get } from "lodash"
import { Room } from "white-web-sdk"
import { GlobalStorage } from "./custom-storage"
import { agoraCaches } from "./web-download.file"

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

export const startDownload = async (isNative: boolean, taskUuid: string, callback: (progress: number) => any) => {
  if (isNative) {
    const controller = new AbortController();
      const resourcesHost = "convertcdn.netless.link";
      const signal = controller.signal;
      const zipUrl = `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
      const res = await fetch(zipUrl, {
          method: "get",
          signal: signal,
      }).then(fetchProgress({
          onProgress: (progress: any) => {
            if (progress.hasOwnProperty('percentage')) {
              callback(get(progress, 'percentage'))
            }
          },
      }));
    console.log("native端 课件下载完成")
  } else {
    await agoraCaches.startDownload(taskUuid, (progress: number, controller: any) => {
      callback(progress)
    })
    console.log("web端 课件下载完成")
  }
}

export const showOriginText = (userRole: EduRoleTypeEnum, messageFromRole: string): boolean => {
  const fromStudent = ['broadcaster', 'audience'].includes(messageFromRole)
  const fromTeacher = ['host', 'assistant'].includes(messageFromRole)
  if ([EduRoleTypeEnum.invisible, EduRoleTypeEnum.student].includes(userRole) && fromStudent) {
    return true
  }
  if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(userRole) && fromTeacher) {
    return false
  }
  return false
 }

export const showMaskText = (text: string, sensitiveWords: string[]) => {
  for (let word of sensitiveWords) {
    const regexp = new RegExp(word, 'g')
    text = text.replace(regexp, "*".repeat(word.length))
  }
  return text
}

export const filterChatText = (userRole: EduRoleTypeEnum, message: EduTextMessage) => {
  const fromUser = message.fromUser
  const chatText = message.message
  if (showOriginText(userRole, fromUser.role)) {
    return chatText
  } else {
    return showMaskText(chatText, message.sensitiveWords)
  }
}