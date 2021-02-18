import { EduLogger, EduRoomType, GenericErrorWrapper } from "agora-rte-sdk";
import { BizLogger } from "@/utils/biz-logger";
import { ApiBase, ApiBaseInitializerParams } from "./base";
import OSS from "ali-oss";
import { MultipartUploadResult } from 'ali-oss';
import uuidv4 from 'uuid/v4';
import { Room, PPT, PPTKind, ApplianceNames, LegacyPPTConverter } from 'white-web-sdk';
import MD5 from 'js-md5';
import { resolveFileInfo } from '@/utils/helper';

const formatExt = (ext: string) => {
  const typeMapper = {
      ppt: 'ppt',
      pptm: 'ppt',
      pptx: 'ppt',
      
      docx: 'word',
      doc: 'word',
      
      xlsx: 'excel',
      xls: 'excel',
      csv: 'excel',
      
      pdf: 'pdf',
      // video audio txt pic
  }
  return typeMapper[ext]
}

export const transDataToResource = (data: any) => {
  if (!data.taskUuid) {
    return {
      id: data.resourceUuid,
      name: data.resourceName,
      ext: data.ext,
      type: formatExt(data.ext),
      calories: data.size || 0,
      url: data.url,
      taskUuid: '',
      taskProgress: null,
      convertedPercentage: 100,
      fat: data.updateTime,
    }
  }
  return {
    id: data.resourceUuid,
    name: data.resourceName,
    ext: data.ext,
    type: formatExt(data.ext),
    calories: data.size || 0,
    taskUuid: data.taskUuid,
    taskProgress: data.taskProgress,
    url: data.url,
    convertedPercentage: data.taskProgress.convertedPercentage,
    fat: data.updateTime
  }
}

export interface UploadServiceResult {
  success: boolean,
  data: any,
  message: string
}

export type UploadConversionType = {
  type: string,
  preview: boolean,
  scale: number,
  outputFormat: string
}

export type FetchStsTokenResult = {
  bucketName: string,
  callbackBody: string,
  callbackContentType: string,
  ossKey: string,
  accessKeyId: string,
  accessKeySecret: string,
  securityToken: string,
  ossEndpoint: string,
}

export type HandleUploadType = {
  file: File,
  fileSize: number,
  resourceName: string,
  userUuid: string,
  roomUuid: string,
  ext: string,
  conversion: any,
  converting: boolean,
  kind: any,
  pptConverter: LegacyPPTConverter,
  pptResult?: any,
  onProgress: (evt: {phase: string, progress: number}) => any,
}


export class UploadService extends ApiBase {

  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
  }

  // 查询服务端是否已经存在课件
  async queryMaterial(params: {name: string, roomUuid: string, userUuid: string}): Promise<UploadServiceResult> {

    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'GET',
    })

    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }

    const files = res.data

    const file = files.find((file: any) => file.resourceName === params.name)

    if (file) {
      return {
        success: true,
        data: file,
        message: 'found'
      }
    }

    return {
      success: false,
      data: null,
      message: 'not_found'
    }
  }

  async fetchStsToken(params: {roomUuid: string, userUuid: string, resourceName: string, ext: string, conversion: UploadConversionType, fileSize: number}) {
    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'POST',
      data: {
        resourceName: params.resourceName,
        ext: params.ext,
        conversion: params.conversion,
        size: params.fileSize
      }
    })
    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }
    return {
      success: true,
      data: res.data as FetchStsTokenResult
    }
  }

  // 服务端创建课件，并申请stsToken
  async createMaterial(params: any): Promise<UploadServiceResult> {

    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/resources/${params.resourceUuid}`,
      method: 'PUT',
      data: {
        url: params.url,
        resourceName: params.resourceName,
        ext: params.ext,
        taskUuid: params.taskUuid ? params.taskUuid : undefined,
        taskToken: '',
        taskProgress: params.taskProgress ? params.taskProgress : undefined,
        size: params.size,
      }
    })

    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }

    const file = res[0]

    if (file) {
      return {
        success: true,
        data: file,
        message: 'found'
      }
    }

    return {
      success: false,
      data: null,
      message: 'not_found'
    }
  }

  async fetchPublicResources(roomUuid: string) {
    const res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/resources`,
      method: 'GET',
    })

    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.msg || res.message
      })
    }

    console.log("loading public resource", JSON.stringify(res.data))

    // const resources = res.data.map(transDataToResource)

    return res.data
  }

  async fetchPersonResources(roomUuid: string, userUuid: string) {
    const res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/resources`,
      method: 'GET',
    })

    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.msg || res.message
      })
    }
    console.log("loading person resource", JSON.stringify(res.data))
    // const resources = res.data.map(transDataToResource)

    return res.data
  }

  async handleUpload(payload: HandleUploadType) {
    const queryResult = await this.queryMaterial({name: payload.resourceName, roomUuid: payload.roomUuid, userUuid: payload.userUuid})
    if (queryResult.success) {
      EduLogger.info(`查询到课件: ${JSON.stringify(queryResult.data)}`)
      payload.onProgress({
        phase: 'finish',
        progress: 100,
      })
      return queryResult.data
    }

    const fetchResult = await this.fetchStsToken({
      roomUuid: payload.roomUuid,
      userUuid: payload.userUuid,
      resourceName: payload.resourceName,
      ext: payload.ext,
      conversion: payload.conversion,
      fileSize: payload.fileSize,
    })

    const ossConfig = fetchResult.data
    const key = ossConfig.ossKey
    const ossClient = new OSS({
      accessKeyId: `${ossConfig.accessKeyId}`,
      accessKeySecret: `${ossConfig.accessKeySecret}`,
      bucket: `${ossConfig.bucketName}`,
      endpoint: `${ossConfig.ossEndpoint}`,
      secure: true,
      stsToken: ossConfig.securityToken,
    })

    if (payload.converting === true) {
      // const pptURL = await this.addFileToOss(
      //   ossClient,
      //   key,
      //   payload.file,
      //   (progress: any) => {
      //     payload.onProgress({
      //       phase: 'upload',
      //       progress
      //     })
      //   },
      //   {
      //     callbackBody: ossConfig.callbackBody,
      //     contentType: ossConfig.callbackContentType,
      //     roomUuid: payload.roomUuid,
      //     userUuid: payload.userUuid,
      //     appId: this.appId
      //   })
      const pptURL = await this.addFileToOss(
        ossClient,
        key,
        payload.file,
        (progress: any) => {
          payload.onProgress({
            phase: 'finish',
            progress
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          roomUuid: payload.roomUuid,
          userUuid: payload.userUuid,
          appId: this.appId
        })
      const pptConverter = payload.pptConverter
      const res = await pptConverter.convert({
        url: pptURL,
        kind: payload.kind,
        onProgressUpdated: (progress: number) => {
          console.log('progress ', progress)
          payload.onProgress({
            phase: 'finish',
            progress
          })
        },
      })

      const convertingModel = {
        taskUuid: res.uuid,
        taskProgress: {
          totalPageSize: res.scenes.length,
          convertedPageSize: res.scenes.length,
          convertedPercentage: 100,
          convertedFileList: res.scenes
        }
      }

      await this.createMaterial({
        roomUuid: payload.roomUuid,
        userUuid: payload.userUuid,
        resourceName: payload.resourceName,
        ext: 'pptx',
        ...convertingModel
      })
      return {
        resourceName: payload.resourceName,
        url: pptURL,
        ext: payload.ext,
        scenes: res.scenes,
      }
    } else {
      const resourceUrl = await this.addFileToOss(
        ossClient,
        key,
        payload.file,
        (progress: any) => {
          payload.onProgress({
            phase: 'finish',
            progress
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          roomUuid: payload.roomUuid,
          userUuid: payload.userUuid,
          appId: this.appId
        })
      // await this.createMaterial({
      //   url: resourceUrl,
      //   roomUuid: payload.roomUuid,
      //   userUuid: payload.userUuid,
      //   resourceName: payload.resourceName,
      //   ext: payload.ext,
      //   size: payload.fileSize,
      // })
      return {
        // resourceUuid: fetchResult.data
        resourceName: payload.resourceName,
        ext: payload.ext,
        url: resourceUrl
      }
    }
  }

  async addFileToOss(ossClient: OSS, key: string, file: File, onProgress: CallableFunction, ossParams: any) {

    const callbackUrl = `https://api-solutions-dev.bj2.agoralab.co/edu/apps/${ossParams.appId}/v1/rooms/${ossParams.roomUuid}/users/${ossParams.userUuid}/resources/callback`;

    console.log(" addFileToOss ", callbackUrl)

    const res: MultipartUploadResult = await ossClient.multipartUpload(
      key,
      file,
      {
        progress: (p: any) => {
          if (onProgress) {
            onProgress(PPTProgressPhase.Uploading, p);
          }
        },
        callback: {
          // TODO: upload-service.ts
          // url: `https://api-solutions.agoralab.co/edu/apps/${ossParams.appId}/v1/rooms/${ossParams.roomUuid}/users/${ossParams.userUuid}/resources/callback`,
          url: callbackUrl,
          body: ossParams.callbackBody,
          contentType: ossParams.contentType,
        }
      });
    if (res.res.status === 200) {
      return ossClient.generateObjectUrl(key);
    } else {
      throw new Error(`upload to ali oss error, status is ${res.res.status}`);
    }
  }

  async fetchImageInfo(file: File, x: number, y: number) {
    await new Promise(resolve => {
      const image = new Image();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        image.src = reader.result as string;
        image.onload = async () => {
          const res = this.getImageSize(image);
          const imageFile: NetlessImageFile = {
            width: res.width,
            height: res.height,
            file: file,
            coordinateX: x,
            coordinateY: y,
          };
          resolve(imageFile);
        };
      };
    })
  }

  private getImageSize(imageInnerSize: imageSize): imageSize {
    const windowSize: imageSize = {width: window.innerWidth, height: window.innerHeight};
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

  async removeMaterials(params: {resourceUuids: string[], roomUuid: string, userUuid: string}) {
    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'DELETE',
      data: {
        resourceUuids: params.resourceUuids
      }
    })

    if (res.code !== 0) {
      throw new GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }
    return res.data
  }

}

export type imageSize = {
  width: number
  height: number
};

export type PPTDataType = {
    active: boolean
    pptType: PPTType
    id: string
    data: any
    cover?: any
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
    init = "init",
}
export type NetlessImageFile = {
  width: number;
  height: number;
  file: File;
  coordinateX: number;
  coordinateY: number;
};

export type TaskType = {
  uuid: string,
  imageFile: NetlessImageFile
};

export type PPTProgressListener = (phase: PPTProgressPhase, percent: number) => void;

export enum PPTProgressPhase {
  Uploading,
  Converting,
}

// export class UploadHelper {

//   private readonly ossClient: any;
//   private readonly ossUploadCallback?: (res: any) => void;
//   public constructor(ossClient: OSS, ossUploadCallback?: (res: any) => void) {
//     this.ossClient = ossClient;
//     this.ossUploadCallback = ossUploadCallback;
//   }
  
//   public async convertFile(
//     rawFile: File,
//     pptConverter: any,
//     kind: PPTKind,
//     folder: string,
//     uuid: string,
//     onProgress?: PPTProgressListener,
//   ): Promise<void> {
//     const {fileType} = resolveFileInfo(rawFile)
//     const ossKey = this.ossClient.ossKey
//     const pptURL = await this.addFile(ossKey, rawFile, onProgress);
//     let res: PPT;
//     if (kind === PPTKind.Static) {
//         res = await pptConverter.convert({
//           url: pptURL,
//           kind: kind,
//           onProgressUpdated: (progress: number) => {
//             if (onProgress) {
//               onProgress(PPTProgressPhase.Converting, progress);
//             }
//           },
//         });
//         const documentFile: PPTDataType = {
//           active: true,
//           id: `${uuidv4()}`,
//           pptType: PPTType.static,
//           data: res.scenes,
//         };
//         const scenePath = MD5(`/${uuid}/${documentFile.id}`);
//         // this.room.putScenes(`/${scenePath}`, res.scenes);
//         // this.room.setScenePath(`/${scenePath}/${res.scenes[0].name}`);
//     } else {
//         res = await pptConverter.convert({
//           url: pptURL,
//           kind: kind,
//           onProgressUpdated: (progress: number) => {
//             if (onProgress) {
//               onProgress(PPTProgressPhase.Converting, progress);
//             }
//           },
//         });
//         const documentFile: PPTDataType = {
//           active: true,
//           id: `${uuidv4()}`,
//           pptType: PPTType.dynamic,
//           data: res.scenes,
//         };
//         const scenePath = MD5(`/${uuid}/${documentFile.id}`);
//         // this.room.putScenes(`/${scenePath}`, res.scenes);
//         // this.room.setScenePath(`/${scenePath}/${res.scenes[0].name}`);
//     }
//     if (onProgress) {
//         onProgress(PPTProgressPhase.Converting, 1);
//     }
//   }
//   private getImageSize(imageInnerSize: imageSize): imageSize {
//     const windowSize: imageSize = {width: window.innerWidth, height: window.innerHeight};
//     const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
//     const maxSize: number = 960;
//     if ((imageInnerSize.width > maxSize && windowSize.width > maxSize) || (imageInnerSize.height > maxSize && windowSize.height > maxSize)) {
//       if (widthHeightProportion > 1) {
//         return {
//           width: maxSize,
//           height: maxSize / widthHeightProportion,
//         };
//       } else {
//         return {
//           width: maxSize * widthHeightProportion,
//           height: maxSize,
//         };
//       }
//     } else {
//       if (imageInnerSize.width > windowSize.width || imageInnerSize.height > windowSize.height) {
//         if (widthHeightProportion > 1) {
//           return {
//             width: windowSize.width,
//             height: windowSize.width / widthHeightProportion,
//           };
//         } else {
//           return {
//             width: windowSize.height * widthHeightProportion,
//             height: windowSize.height,
//           };
//         }
//       } else {
//         return {
//           width: imageInnerSize.width,
//           height: imageInnerSize.height,
//         };
//       }
//     }
//   }
//   public async uploadImageFiles(folder: string, imageFiles: File[], x: number, y: number, onProgress?: PPTProgressListener): Promise<void> {
//     const newAcceptedFilePromises = imageFiles.map(file => this.fetchWhiteImageFileWith(file, x, y));
//     const newAcceptedFiles = await Promise.all(newAcceptedFilePromises);
//     await this.uploadImageFilesArray(folder, newAcceptedFiles, onProgress);
//   }

//   private fetchWhiteImageFileWith(file: File, x: number, y: number): Promise<NetlessImageFile> {
//     return new Promise(resolve => {
//       const image = new Image();
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         image.src = reader.result as string;
//         image.onload = async () => {
//           const res = this.getImageSize(image);
//           const imageFile: NetlessImageFile = {
//             width: res.width,
//             height: res.height,
//             file: file,
//             coordinateX: x,
//             coordinateY: y,
//           };
//           resolve(imageFile);
//         };
//       };
//     });
//   }
//   private async uploadImageFilesArray(folder: string, imageFiles: NetlessImageFile[], onProgress?: PPTProgressListener): Promise<void> {
//     if (imageFiles.length > 0) {

//       const tasks: { uuid: string, imageFile: NetlessImageFile }[] = imageFiles.map(imageFile => {
//         return {
//           uuid: uuidv4(),
//           imageFile: imageFile,
//         };
//       });

//       // for (const {uuid, imageFile} of tasks) {
//       //   const {x, y} = this.room.convertToPointInWorld({x: imageFile.coordinateX, y: imageFile.coordinateY});
//       //   this.room.insertImage({
//       //     uuid: uuid,
//       //     centerX: x,
//       //     centerY: y,
//       //     width: imageFile.width,
//       //     height: imageFile.height,
//       //     locked: false,
//       //   });
//       // }
//       await Promise.all(tasks.map(task => this.handleUploadTask(folder, task, onProgress)));
//       // if (this.room.isWritable) {
//       //   this.room.setMemberState({
//       //     currentApplianceName: ApplianceNames.selector,
//       //   });
//       // }
//     }
//   }
//   private async handleUploadTask(key: string, task: TaskType, onProgress?: PPTProgressListener): Promise<void> {
//     const fileUrl: string = await this.addFile(`${key}`, task.imageFile.file, onProgress);
//     // if (this.room.isWritable) {
//     //   this.room.completeImageUpload(task.uuid, fileUrl);
//     // }
//   }

//   private getFile = (name: string): string => {
//     return this.ossClient.generateObjectUrl(name);
//   }
//   public addFile = async (path: string, rawFile: File, onProgress?: PPTProgressListener): Promise<string> => {
//     const res: MultipartUploadResult = await this.ossClient.multipartUpload(
//       path,
//       rawFile,
//       {
//         progress: (p: any) => {
//           if (onProgress) {
//             onProgress(PPTProgressPhase.Uploading, p);
//           }
//         },
//       });
//       if (this.ossUploadCallback) {
//         this.ossUploadCallback(res);
//       }
//     if (res.res.status === 200) {
//       return this.getFile(path);
//     } else {
//       throw new Error(`upload to ali oss error, status is ${res.res.status}`);
//     }
//   }
// }