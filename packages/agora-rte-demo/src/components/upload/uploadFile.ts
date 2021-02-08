import OSS, { MultipartUploadResult } from 'ali-oss';
import { resolveFileInfo } from '../../utils/helper';
import uuidv4 from 'uuid/v4';
import MD5 from 'js-md5';

export interface IAliOSSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  stsToken?: string;
  bucket?: string;
  endpoint?: string;
  region?: string;
  internal?: boolean;
  secure?: boolean;
  folder?: string;
}
interface IUploadFile {
  path: string
  file: File
  onProgress?: PPTProgressListener,
}
export type PPTType = "dynamic" | "static";
export type PPTDataType = {
  active: boolean
  pptType: PPTType
  id: string
  data: any
  cover?: any
};

export type PPTProgressListener = (phase: PPTProgressPhase, percent: number) => void;

export enum PPTProgressPhase {
  Uploading,
  Converting,
}

interface IConvertFile {
  url: string,
  kind: "image" | "PPTToPicture" | "dynamicPPT"
  onProgress?: PPTProgressListener,
  file: File
  pptConverter: any
}
const convertFileKind = {
  PPTToPicture: 'static',
  image: 'static',
  dynamicPPT: 'dynamic'
}
export class UploadFileProvider {
  private provider: string;
  private ossConfig: IAliOSSConfig;
  private ossClient: OSS | null;
  private folder: string;
  private file: File | undefined
  constructor(config: IAliOSSConfig, provider?: string) {
    this.ossConfig = config
    this.provider = provider || 'aliyun'
    this.ossClient = null
    this.folder = ''
  }

  private initOSSUploadParams(): OSS {
    // if (this.provider === "aliyun") {
    //   return new OSS(this.ossConfig)
    // }
    // TO DO other oss
    return new OSS(this.ossConfig)
  }
  public uploadFile = async (params: IUploadFile) => {
    this.ossClient = this.initOSSUploadParams()
    const { path, file, onProgress } = params
    const uploadPath = `${this.ossConfig.folder}${path}`
    const res: MultipartUploadResult = await this.ossClient.multipartUpload(uploadPath, file, {
      progress: (p: any) => {
        console.log(p)
        if (onProgress) {
        }
      },
    })
    console.log(res);

  }
  public setFolder(folderPath: string) {
    this.folder = folderPath
    this.ossConfig = {
      ... this.ossConfig,
      "folder": folderPath
    }
  }
  public convertFile = async (params: IConvertFile) => {
    return new Promise((resolve) => {
      const { kind, url, pptConverter, file, onProgress } = params;
      const { fileType } = resolveFileInfo(this.file);
      const uuid = uuidv4();
      const path = `${this.folder}${uuid}${fileType}`
      const pptURL = this.uploadFile({ path, file, onProgress });
      const res = pptConverter.convert({
        url: pptURL,
        kind: convertFileKind[kind],
        onProgressUpdated: (progress: number) => {
          onProgress && onProgress(PPTProgressPhase.Converting, progress);
        },
      })
      const documentFile: PPTDataType = {
        active: true,
        id: `${uuidv4()}`,
        pptType: (convertFileKind[kind] as PPTType),
        data: res.scenes,
      };
      const scenePath = MD5(`/${uuid}/${documentFile.id}`);
      resolve({
        scenes: res.scenes,
        scenePath: `/${scenePath}/${res.scenes[0].name}`
      })
    })
  }

}