import MD5 from 'js-md5';
import { toLower } from 'lodash';
import { EduClassroomConfig } from '../../../../configs';
import { CloudDriveResource } from './struct';

export type ConversionOption = {
  type: string;
  preview: boolean;
  scale: number;
  outputFormat: string;
  canvasVersion: boolean;
};

export class CloudDriveUtils {
  static calcResourceUuid(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file); //计算文件md5
      fileReader.onload = (evt: ProgressEvent<FileReader>) => {
        if (evt.target && evt.target.result) {
          // TODO why MD5 twice?
          const md5Str = MD5(evt.target.result);
          return resolve(md5Str);
        }
        reject(new Error('unknown error: no result in filereader'));
      };
      fileReader.onerror = () => {
        reject(new Error(`Error reading ${file.name}`));
      };
    });
  }

  static extractFileExt(name: string): string | undefined {
    let re = /(?:\.([^.]+))?$/;
    const ext = re.exec(name);
    return ext ? ext[1] : undefined;
  }

  static conversionOption(ext: string, scale?: number): ConversionOption | undefined {
    const needConvert = CloudDriveResource.convertableTypes.includes(toLower(ext));
    const needDynamicConvert = CloudDriveResource.convertableDynamicTypes.includes(toLower(ext));

    return needConvert
      ? {
          type: needDynamicConvert ? 'dynamic' : 'static',
          preview: true,
          scale: scale || EduClassroomConfig.shared.boardDefaults.scale,
          outputFormat: 'png',
          canvasVersion: needDynamicConvert,
        }
      : undefined;
  }

  // cancelFileUpload() {
  //   if (this.ossClient) {
  //     (this.ossClient as any).cancel()
  //   }
  //   if (this.xhr) {
  //     this.xhr.abort()
  //   }
  //   console.log('cancelFileUpload click cancel')
  // }
}
