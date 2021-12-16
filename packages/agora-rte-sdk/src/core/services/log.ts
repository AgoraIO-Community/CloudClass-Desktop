import { AgoraRteEngineConfig } from '../../configs';
import { ApiBase } from './base';
import { AGRteErrorCode, RteErrorCenter } from '../utils/error';
import { OSSFileUploader } from './oss';

export class AgoraLogService extends ApiBase {
  async uploadZipLogFile(roomId: string, file: any) {
    const res = await this.uploadToOss(roomId, file, 'zip');
    return res;
  }

  // upload log
  async uploadLogFile(roomId: string, file: any) {
    const res = await this.uploadToOss(roomId, file, 'log');
    return res;
  }

  async uploadToOss(roomId: string, file: File, ext: string) {
    try {
      const uploader = new OSSFileUploader(AgoraRteEngineConfig.shared.appId, roomId);

      await uploader.upload(file, ext);
    } catch (err) {
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_LOG_UPLOAD_FAIL,
        err as Error,
      );
    }
  }

  async uploadElectronLog(roomId: any) {
    //@ts-ignore
    if (window.doGzip) {
      //@ts-ignore
      let file = await window.doGzip();
      const res = await this.uploadZipLogFile(roomId, file);
      return res;
    }
  }
}
