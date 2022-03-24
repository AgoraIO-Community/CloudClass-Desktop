import OSS from 'ali-oss';
import { CancelTokenSource } from 'axios';
export interface CloudDriveResourceInfo {
  resourceName: string;
  url: string;
  ext: string;
  size: number;
  conversion?: Object;
}

export interface CloudDriveResourceConvertProgress {
  prefix?: string;
  status: 'Waiting' | 'Converting' | 'Finished' | 'Fail';
  totalPageSize: number;
  convertedPageSize: number;
  convertedPercentage: number;
  convertedFileList: {
    name: string;
    ppt: {
      width: number;
      height: number;
      preview?: string;
      src: string;
    };
  }[];
  currentStep: string;
}

export interface CloudDrivePagingOption {
  resourceName?: string;
  pageNo: number;
  pageSize?: number;
}

export enum CloudDriveResourceUploadStatus {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  Canceled = 'canceled',
}
export enum UploadType {
  COMMON_XHR = 'COMMON_XHR',
}
export type CheckPointsValue<T = UploadType.COMMON_XHR, C = unknown> = {
  type: UploadType;
  checkPoint?: T extends UploadType.COMMON_XHR ? CancelTokenSource : C;
  file: File;
};
export type Checkpoints = Map<string, CheckPointsValue>;
