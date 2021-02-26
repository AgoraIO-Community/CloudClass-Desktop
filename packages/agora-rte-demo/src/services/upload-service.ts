import { EduLogger, EduRoomType, GenericErrorWrapper } from "agora-rte-sdk";
import { BizLogger } from "@/utils/biz-logger";
import { ApiBase, ApiBaseInitializerParams } from "./base";
import OSS from "ali-oss";
import { MultipartUploadResult } from 'ali-oss';
import uuidv4 from 'uuid/v4';
import { Room, PPT, PPTKind, ApplianceNames, LegacyPPTConverter } from 'white-web-sdk';
import MD5 from 'js-md5';
import { resolveFileInfo } from '@/utils/helper';
import { CourseWareItem } from "@/edu-sdk";
import { get } from "lodash";
import { CourseWareUploadResult, CreateMaterialParams } from "@/types/global";

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


export const mapFileType = (type: string): string => {
  if (type.match(/ppt|pptx|pptx/i)) {
    return 'ppt'
  }
  if (type.match(/doc|docx/i)) {
    return 'word'
  }
  if (type.match(/xls|xlsx/i)) {
    return 'excel'
  }
  if (type.match(/mp4/i)) {
    return 'video'
  }
  if (type.match(/mp3/i)) {
    return 'audio'
  }

  if (type.match(/txt/i)) {
    return 'txt'
  }

  if (type.match(/gif|png|jpeg|jpg|bmp/i)) {
    return 'pic'
  }
  if (type.match(/pdf/i)) {
    return 'pdf'
  }

  return 'txt'
}

export const fileSizeConversionUnit= (data: number | string) => {
  const toMB = 1024 * 1024
  let transData = data;
  if (typeof (data) === 'string') {
    transData = parseInt(data, 10)
  }
  return ((transData as number) / toMB).toFixed(2) + 'MB'
}
export const transDataToResource = (data: CourseWareItem) => {
  if (!data.taskUuid) {
    return {
      id: data.resourceUuid,
      name: data.resourceName,
      ext: data.ext,
      type: mapFileType(data.ext),
      calories: fileSizeConversionUnit(data.size) || 0,
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
    type: mapFileType(data.ext),
    calories: fileSizeConversionUnit(data.size) || 0,
    taskUuid: data.taskUuid,
    taskProgress: data.taskProgress,
    url: data.url,
    convertedPercentage: data.taskProgress!.convertedPercentage,
    fat: data.updateTime,
    scenes: data.scenes,
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
  resourceUuid: string,
  resourceName: string,
  userUuid: string,
  roomUuid: string,
  ext: string,
  conversion: any,
  converting: boolean,
  kind: any,
  pptConverter: LegacyPPTConverter,
  pptResult?: any,
  onProgress: (evt: {phase: string, progress: number,isTransFile?:boolean,isLastProgress?:boolean}) => any,
}


export class UploadService extends ApiBase {
  ossClient: OSS | null;
  abortCheckpoint:{
    name?:string,
    uploadId?:string
  }
  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.ossClient = null
    this.abortCheckpoint = {
      name: '',
      uploadId: ''
    }
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
  }

  // 查询服务端是否已经存在课件
  async queryMaterial(params: {name: string, roomUuid: string}): Promise<UploadServiceResult> {

    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/resources`,
      method: 'GET',
    })

    if (res.code !== 0) {
      throw GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }

    const files = res.data
    const file = files.find((fileItem: any) => {
      console.log(fileItem.resourceName, params.name)
      return fileItem.resourceName === params.name
    })
    console.log('onProgress', file, params.name)

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

  async fetchStsToken(params: {resourceUuid: string, roomUuid: string, resourceName: string, ext: string, conversion: UploadConversionType, fileSize: number}) {
    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/resources/${params.resourceUuid}/sts`,
      method: 'PUT',
      data: {
        resourceName: params.resourceName,
        ext: params.ext,
        conversion: params.conversion,
        size: params.fileSize
      }
    })
    if (res.code !== 0) {
      throw GenericErrorWrapper({
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
  async createMaterial(params: CreateMaterialParams): Promise<UploadServiceResult> {
    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/resources/${params.resourceUuid}`,
      method: 'PUT',
      data: {
        url: params.url,
        resourceName: params.resourceName,
        ext: params.ext,
        taskUuid: params.taskUuid,
        taskToken: params.taskToken,
        taskProgress: params.taskProgress,
        size: params.size,
      }
    })

    if (res.code !== 0) {
      throw GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }

    const data = res.data

    if (data) {
      return {
        success: true,
        data: data,
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
      throw GenericErrorWrapper({
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
      throw GenericErrorWrapper({
        code: res.code,
        message: res.msg || res.message
      })
    }
    console.log("loading person resource", JSON.stringify(res.data))
    // const resources = res.data.map(transDataToResource)

    return res.data
  }

  async getFileInQueryMateria(payload: {
    roomUuid: string,
    resourceName: string
  }) {
  return await this.queryMaterial({name: payload.resourceName, roomUuid: payload.roomUuid})
    }
  async handleUpload(payload: HandleUploadType) {
    const queryResult = await this.getFileInQueryMateria(payload)
    if (queryResult.success) {
      EduLogger.info(`查询到课件: ${JSON.stringify(queryResult.data)}`)
      payload.onProgress({
        phase: 'finish',
        progress: 1,
        isLastProgress:true
      })
      console.log("query#data ", queryResult.data)
      return queryResult.data
    }

    const fetchResult = await this.fetchStsToken({
      roomUuid: payload.roomUuid,
      // userUuid: payload.userUuid,
      resourceName: payload.resourceName,
      resourceUuid: payload.resourceUuid,
      ext: payload.ext,
      conversion: payload.conversion,
      fileSize: payload.fileSize,
    })

    const ossConfig = fetchResult.data
    const key = ossConfig.ossKey
    this.ossClient = new OSS({
      accessKeyId: `${ossConfig.accessKeyId}`,
      accessKeySecret: `${ossConfig.accessKeySecret}`,
      bucket: `${ossConfig.bucketName}`,
      endpoint: `${ossConfig.ossEndpoint}`,
      secure: true,
      stsToken: ossConfig.securityToken,
    })

    const fetchCallbackBody: any = JSON.parse(ossConfig.callbackBody)
    
    console.log("callback body: ", fetchCallbackBody)
    const resourceUuid = fetchCallbackBody.resourceUuid

    if (payload.converting === true) {
      const uploadResult = await this.addFileToOss(
        this.ossClient,
        key,
        payload.file,
        (...args: any) => {
           console.log('onProgress converting',args)
          payload.onProgress({
            phase: 'finish',
            progress: args[1]
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          roomUuid: payload.roomUuid,
          // userUuid: payload.userUuid,
          appId: this.appId
        })
      const pptConverter = payload.pptConverter
      const taskResult: any = await pptConverter.convert({
        url: uploadResult.ossURL,
        kind: payload.kind,
        onProgressUpdated: (...args: any[]) => {
          console.log('onProgressUpdated',args)
          payload.onProgress({
            phase: 'finish',
            progress: args[0],
            isTransFile: true,
          })
        },
      })
      console.log("转换完成 ", JSON.stringify(taskResult))
      payload.onProgress({
        phase: 'finish',
        progress: 1,
        isTransFile: true,
        isLastProgress: true
      })

      let materialResult = await this.createMaterial({
        taskUuid: taskResult.uuid,
        url: uploadResult.ossURL,
        roomUuid: payload.roomUuid,
        // userUuid: payload.userUuid,
        resourceName: payload.resourceName,
        resourceUuid,
        taskToken: taskResult.roomToken,
        ext: taskResult.ext,
        size: uploadResult.size,
        taskProgress: {
          totalPageSize: taskResult.scenes.length,
          convertedPageSize: taskResult.scenes.length,
          convertedPercentage: 100,
          convertedFileList: taskResult.scenes
        }
      })
      return {
        resourceUuid: resourceUuid,
        resourceName: uploadResult.resourceName,
        ext: uploadResult.ext,
        size: fetchCallbackBody.size,
        url: uploadResult.ossURL,
        scenes: taskResult.scenes,
        taskProgress: {
          totalPageSize: taskResult.scenes.length,
          convertedPageSize: taskResult.scenes.length,
          convertedPercentage: 100,
          convertedFileList: taskResult.scenes
        },
        updateTime: materialResult.data.updateTime,
        taskUuid: taskResult.uuid,
      }
    } else {
      const uploadResult = await this.addFileToOss(
       this.ossClient,
        key,
        payload.file,
        (...args: any[]) => {
          console.log('onProgress uploadResult addFileToOss ',args)
          payload.onProgress({
            phase: 'finish',
            progress:args[1],
            isLastProgress:true
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          roomUuid: payload.roomUuid,
          userUuid: payload.userUuid,
          appId: this.appId
        })

      const result: CourseWareUploadResult = {
        resourceUuid: resourceUuid,
        resourceName: uploadResult.resourceName,
        ext: uploadResult.ext,
        size: fetchCallbackBody.size,
        url: uploadResult.ossURL,
        updateTime: uploadResult.updateTime,
      }
      return result
    }
  }
   cancelFileUpload() {
    // const { name = '', uploadId = '' } = this.abortCheckpoint
    // this.ossClient?.abortMultipartUpload(name, uploadId);
    (this.ossClient as any).cancel()
    console.log('error click cancel', (this.ossClient as any)?.cancel())
  }

  async addFileToOss(ossClient: OSS, key: string, file: File, onProgress: CallableFunction, ossParams: any) {

    const prefix = `${REACT_APP_AGORA_APP_SDK_DOMAIN}` === `https://api-solutions-dev.bj2.agoralab.co` ? `https://api-solutions-dev.bj2.agoralab.co` : `https://api-solutions.agoralab.co`
    // TODO: 生产环境需要更替地址
    const callbackUrl = `${prefix}/edu/apps/${ossParams.appId}/v1/rooms/${ossParams.roomUuid}/resources/callback`

    console.log(" addFileToOss ", callbackUrl)

    try{
    const res: MultipartUploadResult = await ossClient.multipartUpload(
      key,
      file,
      {
        progress: (p, cpt, res) => {
          this.abortCheckpoint = cpt
          if (onProgress) {
             console.log('onProgress  addFileToOss function ',PPTProgressPhase.Uploading, p)
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
      const data = get(res.data, 'data', {})
      console.log(" >>> data", data)
      return {
        ossURL: ossClient.generateObjectUrl(key),
        ...data
      }
    } else {
      throw new Error(`upload to ali oss error, status is ${res.res.status}`);
    }
  }catch (err) {
      console.log('error', err)
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
      url: `/v1/rooms/${params.roomUuid}/resources`,
      method: 'DELETE',
      data: {
        resourceUuids: params.resourceUuids
      }
    })

    if (res.code !== 0) {
      throw GenericErrorWrapper({
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