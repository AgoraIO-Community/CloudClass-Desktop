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
