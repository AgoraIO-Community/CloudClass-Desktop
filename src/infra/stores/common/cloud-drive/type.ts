export interface CloudDriveResourceConvertProgress {
  prefix?: string;
  status: 'Waiting' | 'Converting' | 'Finished' | 'Fail';
  totalPageSize: number;
  convertedPageSize: number;
  convertedPercentage: number;
  convertedFileList: {
    name?: string;
    ppt: {
      preview?: string;
      src: string;
      width: number;
      height: number;
    };
  }[];
  currentStep: string;
  previews: Record<number, string>;
  images: Record<
    number,
    {
      width: number;
      height: number;
      url: string;
    }
  >;
}
