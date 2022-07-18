export interface CloudDriveResourceConvertProgress {
  prefix?: string;
  status: 'Waiting' | 'Converting' | 'Finished' | 'Fail';
  totalPageSize: number;
  convertedPageSize: number;
  convertedPercentage: number;
  convertedFileList: [];
  currentStep: string;
}
