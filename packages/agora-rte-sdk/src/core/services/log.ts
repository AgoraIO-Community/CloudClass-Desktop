import { AgoraRteEngineConfig } from '../../configs';
import { ApiBase } from './base';
import { AGRteErrorCode, RteErrorCenter } from '../utils/error';
import { OSSFileUploader, TagInfo } from './oss';

export class AgoraLogService extends ApiBase {
  async uploadZipLogFile(tagInfo: TagInfo, file: any) {
    const res = await this.uploadToOss(tagInfo, file, 'zip');
    return res;
  }

  // upload log
  async uploadLogFile(tagInfo: TagInfo, file: any) {
    const res = await this.uploadToOss(tagInfo, file, 'log');
    return res;
  }

  async uploadToOss(tagInfo: TagInfo, file: File, ext: string) {
    try {
      const uploader = new OSSFileUploader(AgoraRteEngineConfig.shared.appId, tagInfo);

      await uploader.upload(file, ext);
    } catch (err) {
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_LOG_UPLOAD_FAIL,
        err as Error,
      );
    }
  }

  async uploadElectronLog(tagInfo: TagInfo) {
    //@ts-ignore
    if (window.doGzip) {
      //@ts-ignore
      let file = await window.doGzip();
      const res = await this.uploadZipLogFile(tagInfo, file);
      return res;
    }
  }
}
