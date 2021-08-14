import { CourseWareItem } from "../api/declare";
import { CourseWareUploadResult, CreateMaterialParams } from "../types";
import { fileSizeConversionUnit } from "../utilities/kit";
import { EduLogger, GenericErrorWrapper } from "agora-rte-sdk";
import OSS, { MultipartUploadResult } from "ali-oss";
import { createPPTTask } from 'white-web-sdk';
import { ApiBase, ApiBaseInitializerParams } from "./base";
import axios from 'axios';

export const mapFileType = (type: string): any => {
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

  if (type.match(/gif|png|jpeg|jpg|bmp/i)) {
    return 'image'
  }
  if (type.match(/pdf/i)) {
    return 'pdf'
  }

  return 'excel'
}

export type MaterialAccess = 'public' | 'private' | 'extra'

export type MaterialDataResource = {
  id: string,
  name: string,
  ext: string,
  type: string,
  size: string | number,
  taskUuid: string,
  taskProgress: any,
  url: string,
  convertedPercentage?: number,
  updateTime: number,
  scenes?: any[],
  access: MaterialAccess
}

export const transDataToResource = (data: CourseWareItem, access: MaterialAccess): MaterialDataResource => {
  if (!data.taskUuid) {
    return {
      id: data.resourceUuid,
      name: data.resourceName,
      ext: data.ext,
      type: mapFileType(data.ext),
      size: fileSizeConversionUnit(data.size) || 0,
      url: data.url,
      taskUuid: '',
      taskProgress: null,
      convertedPercentage: 100,
      updateTime: data.updateTime,
      access
    }
  }
  return {
    id: data.resourceUuid,
    name: data.resourceName,
    ext: data.ext,
    type: mapFileType(data.ext),
    size: fileSizeConversionUnit(data.size) || 0,
    taskUuid: data.taskUuid,
    taskProgress: data.taskProgress,
    url: data.url,
    convertedPercentage: data.taskProgress!.convertedPercentage,
    updateTime: data.updateTime,
    scenes: data.scenes || data.taskProgress?.convertedFileList,
    access
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
  vendor: number,
  preSignedUrl: string,
  callbackHost: string,
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
  pptResult?: any,
  onProgress: (evt: {phase: string, progress: number,isTransFile?:boolean,isLastProgress?:boolean}) => any,
  personalResource?: boolean
  
}


export class UploadService extends ApiBase {
  ossClient: OSS | null;
  xhr: XMLHttpRequest;
  abortCheckpoint:{
    name?:string,
    uploadId?:string
  }
  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.ossClient = null
    this.xhr = new XMLHttpRequest()
    this.abortCheckpoint = {
      name: '',
      uploadId: ''
    }
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
  }

  region: string = 'cn-hz'

  setRegion(region: string) {
    EduLogger.info(`upload-service set region ${region}`)
    this.region = region
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
      return fileItem.resourceName === params.name
    })

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

  async fetchStsToken(params: {resourceUuid: string, roomUuid: string, resourceName: string, ext: string, fileSize: number, conversion?: UploadConversionType}) {
    const res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/resources/${params.resourceUuid}/sts`,
      method: 'PUT',
      data: {
        resourceName: params.resourceName,
        ext: params.ext,
        // conversion: params.conversion,
        size: params.fileSize,
        conversion: params.conversion ?? undefined,
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

  async fetchPersonalPresignedURL(params: {userUuid: string, resourceUuid: string, roomUuid: string, resourceName: string, ext: string, fileSize: number, conversion?: UploadConversionType}) {
    const res = await this.fetch({
      url: `/v2/uses/${params.userUuid}/resources/${params.resourceUuid}/presigned`,
      method: 'GET',
      data: {
        // resourceName: params.resourceName,
        // ext: params.ext,
        // // conversion: params.conversion,
        // size: params.fileSize,
        // conversion: params.conversion ?? undefined,
        resourceName: params.resourceName,     //文件名
        size: params.fileSize,   //文件大小
        ext: params.ext,       //扩展名 ppt、pptx、pptm、docx、doc、xlsx、xls、csv、pdf等
        tags: [],        //tag列表，每个资源最多10个标签
        conversion: params.conversion
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
    // const resources = res.data.map(transDataToResource)

    return res.data
  }

  async getFileInQueryMaterial(payload: {
    roomUuid: string,
    resourceName: string
  }) {
    return await this.queryMaterial({name: payload.resourceName, roomUuid: payload.roomUuid})
  }

  async handleUpload(payload: HandleUploadType) {
    // const queryResult = await this.getFileInQueryMaterial(payload)
    // if (queryResult.success) {
    //   EduLogger.info(`查询到课件: ${JSON.stringify(queryResult.data)}`)
    //   payload.onProgress({
    //     phase: 'finish',
    //     progress: 1,
    //     isLastProgress:true
    //   })
    //   return queryResult.data
    // }
    const conversion = payload.converting ? {
        type: payload.ext === 'pptx' ? 'dynamic' : 'static',
        preview: false,
        scale: 1.2,
        outputFormat: 'png',
      } : undefined
    let fetchResult = await this.fetchStsToken({
      roomUuid: payload.roomUuid,
      // userUuid: payload.userUuid,
      resourceName: payload.resourceName,
      resourceUuid: payload.resourceUuid,
      ext: payload.ext,
      fileSize: payload.fileSize,
      conversion,
    })
    // use presigned url
    // fetchResult = await this.fetchPersonalPresignedURL({
    //   userUuid: payload.userUuid,
    //   roomUuid: payload.roomUuid,
    //   // userUuid: payload.userUuid,
    //   resourceName: payload.resourceName,
    //   resourceUuid: payload.resourceUuid,
    //   ext: payload.ext,
    //   // conversion: payload.conversion,
    //   fileSize: payload.fileSize,
    //   conversion: payload.converting ? {
    //     type: payload.ext === 'pptx' ? 'dynamic' : 'static',
    //     preview: false,
    //     scale: 1.2,
    //     outputFormat: 'png',
    //   } : undefined,
    // })


    const ossConfig = fetchResult.data
    const vendor = ossConfig.vendor
    let result
    if (vendor === 1) {
      // aws
      result = await this.handleUploadByAWS(ossConfig, payload)
    } else if (vendor === 2) {
      // ali
      // result = await this.addFileToOssPreSigned(ossConfig, payload);
      result =  await this.handleUploadByAli(ossConfig, payload, conversion)
    }
    return result
  }
  
  async handleUploadByAli (ossConfig: FetchStsTokenResult, payload: HandleUploadType, conversion: any) {
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
    
    const resourceUuid = fetchCallbackBody.resourceUuid

    const uploadResult = await this.addFileToOss(
      this.ossClient,
      key,
      payload.file,
      (...args: any) => {
        payload.onProgress({
          phase: 'finish',
          progress: args[1],
          isLastProgress: !payload.converting
        })
      },
      {
        callbackBody: ossConfig.callbackBody,
        contentType: ossConfig.callbackContentType,
        roomUuid: payload.roomUuid,
        userUuid: payload.userUuid,
        appId: this.appId,
        callbackHost: ossConfig.callbackHost
    })

    let taskRes = {};
    
    if(payload.converting) {
      const resp = createPPTTask({
        uuid: uploadResult.taskUuid,
        kind: payload.kind,
        taskToken: uploadResult.taskToken,
        region: this.region,
        callbacks: {
          onProgressUpdated: progress => {
            console.log(' onProgressUpdated ', progress)
            payload.onProgress({
              phase: 'finish',
              progress: progress.convertedPercentage,
              isTransFile: true,
            })
          },
          onTaskFail: () => {
            console.log(' onTaskFail ')
            payload.onProgress({
              phase: 'finish',
              progress: 1,
              isTransFile: true,
            })
          },
          onTaskSuccess: () => {
            console.log(' onTaskSuccess ')
            payload.onProgress({
              phase: 'finish',
              progress: 1,
              isTransFile: true,
            })
          }
        },
        checkProgressTimeout: 20 * 60 * 1000
      })
  
      const ppt = await resp.checkUtilGet();

      payload.onProgress({
        phase: 'finish',
        progress: 1,
        isTransFile: true,
        isLastProgress: true
      })

      let materialResult = await this.createMaterial({
        taskUuid: ppt.uuid,
        url: uploadResult.ossURL,
        roomUuid: payload.roomUuid,
        // userUuid: payload.userUuid,
        resourceName: payload.resourceName,
        resourceUuid,
        taskToken: uploadResult.taskToken,
        ext: payload.ext,
        size: uploadResult.size,
        taskProgress: {
          totalPageSize: ppt.scenes.length,
          convertedPageSize: ppt.scenes.length,
          convertedPercentage: 100,
          convertedFileList: ppt.scenes
        }
      })

      taskRes = {
        scenes: ppt.scenes,
        taskProgress: {
          totalPageSize: ppt.scenes.length,
          convertedPageSize: ppt.scenes.length,
          convertedPercentage: 100,
          convertedFileList: ppt.scenes
        },
        updateTime: materialResult.data.updateTime,
      }
    }

    await this.addUserResourceRelation({ 
      userUuid: payload.userUuid, 
      resourceUuid: payload.resourceUuid,
      resourceName: uploadResult.resourceName, 
      resourceURL: uploadResult.ossURL,
      ext: payload.ext,
      fileSize: payload.fileSize,
      conversion
    })

    return {
      ...taskRes,
      resourceUuid: resourceUuid,
      resourceName: uploadResult.resourceName,
      ext: uploadResult.ext,
      size: fetchCallbackBody.size,
      url: uploadResult.ossURL,
      updateTime: uploadResult.updateTime,
      taskUuid: uploadResult.taskUuid,
    }

  }

  async handleUploadByAWS (ossConfig: FetchStsTokenResult, payload: HandleUploadType) {
    const fetchCallbackBody: any = JSON.parse(ossConfig.callbackBody)
    
    const resourceUuid = fetchCallbackBody.resourceUuid

    if (payload.converting === true) {
      const uploadResult: any = await this.addFileToAWS(
        payload.file,
        (...args: any) => {
          payload.onProgress({
            phase: 'finish',
            progress: args[0]
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          preSignedUrl: ossConfig.preSignedUrl,
          roomUuid: payload.roomUuid,
          // userUuid: payload.userUuid,
          appId: this.appId,
          callbackHost: ossConfig.callbackHost
        }
      )
      console.log('upload-service [12]', uploadResult)
      const resp = createPPTTask({
        uuid: uploadResult.taskUuid,
        kind: payload.kind,
        taskToken: uploadResult.taskToken,
        region: this.region,
        callbacks: {
          onProgressUpdated: progress => {
            console.log(' onProgressUpdated ', progress)
              payload.onProgress({
                phase: 'finish',
                progress: progress.convertedPercentage,
                isTransFile: true,
              })
            },
            onTaskFail: () => {
              console.log(' onTaskFail ')
              payload.onProgress({
                phase: 'finish',
                progress: 1,
                isTransFile: true,
              })
            },
            onTaskSuccess: () => {
              console.log(' onTaskSuccess ')
              payload.onProgress({
                phase: 'finish',
                progress: 1,
                isTransFile: true,
              })
            },
        }
      })
  
      const ppt = await resp.checkUtilGet();
  
      payload.onProgress({
        phase: 'finish',
        progress: 1,
        isTransFile: true,
        isLastProgress: true
      })
  
      let materialResult = await this.createMaterial({
        taskUuid: ppt.uuid,
        url: uploadResult.ossURL,
        roomUuid: payload.roomUuid,
        // userUuid: payload.userUuid,
        resourceName: payload.resourceName,
        resourceUuid,
        taskToken: uploadResult.taskToken,
        ext: payload.ext,
        size: uploadResult.size,
        taskProgress: {
          totalPageSize: ppt.scenes.length,
          convertedPageSize: ppt.scenes.length,
          convertedPercentage: 100,
          convertedFileList: ppt.scenes
        }
      })
      return {
        resourceUuid: resourceUuid,
        resourceName: uploadResult.resourceName,
        ext: uploadResult.ext,
        size: fetchCallbackBody.size,
        url: uploadResult.ossURL,
        scenes: ppt.scenes,
        taskProgress: {
          totalPageSize: ppt.scenes.length,
          convertedPageSize: ppt.scenes.length,
          convertedPercentage: 100,
          convertedFileList: ppt.scenes
        },
        updateTime: materialResult.data.updateTime,
        taskUuid: uploadResult.taskUuid,
      }
    } else {
      const uploadResult: any = await this.addFileToAWS(
        payload.file,
        (...args: any) => {
          payload.onProgress({
            phase: 'finish',
            progress: args[0],
            isLastProgress: true
          })
        },
        {
          callbackBody: ossConfig.callbackBody,
          contentType: ossConfig.callbackContentType,
          preSignedUrl: ossConfig.preSignedUrl,
          roomUuid: payload.roomUuid,
          // userUuid: payload.userUuid,
          appId: this.appId,
          callbackHost: ossConfig.callbackHost
        }
      )
      console.log('upload-service [1]', uploadResult)
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
    if (this.ossClient) {
      (this.ossClient as any).cancel()
    }
    if (this.xhr) {
      this.xhr.abort()
    }
    console.log('cancelFileUpload click cancel')
  }

  get uploadCallbackPrefix() {
    const getDomain: Record<string, string> = {
      'https://api.agora.io': 'https://api-solutions.agoralab.co/',
      'https://api-test.agora.io/preview': 'https://api-solutions-pre.agoralab.co/',
      'https://api-solutions-dev.bj2.agoralab.co': 'https://api-solutions-dev.bj2.agoralab.co',
    }

    const defaultDomain = getDomain['https://api-solutions-dev.bj2.agoralab.co'];

    const ossCallbackDomain = getDomain[this.sdkDomain]

    if (ossCallbackDomain) {
      return ossCallbackDomain
    }
    return defaultDomain;
  }

  async addFileToOss(ossClient: OSS, key: string, file: File, onProgress: CallableFunction, ossParams: any) {
    const prefix = ossParams.callbackHost
    const callbackUrl = `${prefix}/edu/apps/${ossParams.appId}/v1/rooms/${ossParams.roomUuid}/resources/callback`
    try{


    const res: MultipartUploadResult = await ossClient.multipartUpload(
      key,
      file,
      {
        progress: (p, cpt, res) => {
          this.abortCheckpoint = cpt
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

      console.log("[agora-edu-core] res >>>>> ", res)
    if (res.res.status === 200) {
      const data = (res as any).data?.data ?? {}
      console.log('upload res data ', data)
      // const data = get(res.data, 'data', {})
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

  async addFileToOssPreSigned(stsTokenResult: FetchStsTokenResult, payload: HandleUploadType): Promise<any> {
    const prefix = stsTokenResult.callbackHost
    const callbackUrl = `${prefix}/v2/users/${payload.userUuid}/resources/${payload.resourceUuid}/callback`
    return new Promise(async (resolve, reject) => {
        let config = {
          headers: {
            'Content-Type': payload.file.type,
          },
          onUploadProgress: (progressEvent: any) => {
            let percentCompleted = Math.floor(progressEvent.loaded * 100 / progressEvent.total);
            payload.onProgress({ 
              phase: 'finish',
              progress: percentCompleted / 100
            })
          }
        }
        try {
          await axios.put(stsTokenResult.preSignedUrl, payload.file, config)
          const result = await axios.post(callbackUrl, JSON.parse(stsTokenResult.callbackBody), {
            headers: {
              ['content-type']: stsTokenResult.callbackContentType
            }
          })
          resolve({
            ...result.data.data,
            ossURL: result.data.data.url
          })
        } catch (err) {
          reject(err)
        }
      })

  }

  addFileToAWS (file: File, onProgress: CallableFunction, ossParams: any) {
    const prefix = ossParams.callbackHost
    const callbackUrl = `${prefix}/edu/apps/${ossParams.appId}/v1/rooms/${ossParams.roomUuid}/resources/callback`
    return new Promise(async (resolve, reject) => {
        let config = {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent: any) => {
            let percentCompleted = Math.floor(progressEvent.loaded * 100 / progressEvent.total);
            onProgress(percentCompleted / 100)
          }
        }
        try {
          await axios.put(ossParams.preSignedUrl, file, config)
          const result = await axios.post(callbackUrl, JSON.parse(ossParams.callbackBody), {
            headers: {
              ['content-type']: ossParams.contentType
            }
          })
          resolve({
            ...result.data.data,
            ossURL: result.data.data.url
          })
        } catch (err) {
          reject(err)
        }
      })
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
  
  async addUserResourceRelation(params: {resourceUuid: string, resourceName: string, userUuid: string, conversion: any, ext: string, resourceURL: string, fileSize: number}) {
    let res = await this.fetch({
      url: `/v2/resources/${params.resourceUuid}`,
      method: 'PUT',
      data: {
        resourceName: params.resourceName,     //文件名
        size: params.fileSize,   //文件大小
        ext: params.ext,       //扩展名 ppt、pptx、pptm、docx、doc、xlsx、xls、csv、pdf等
        url: params.resourceURL,       //网络地址
        conversion: params.conversion,
        userUuids: [params.userUuid]
      }
    })

    if (res.code !== 0) {
      throw GenericErrorWrapper({
        code: res.code,
        message: res.message
      })
    }
  }
  
  async removeUserResourceRelation(relations : Array<{ resourceUuid: string, userUuid: string }>) {
    const res = await this.fetch({
      url: `/v2/resources/users`,
      method: 'DELETE',
      data: relations
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