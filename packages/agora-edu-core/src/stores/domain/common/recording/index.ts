import { EduStoreBase } from '../base';
import { EduClassroomConfig } from '../../../..';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';

export class RecordingStore extends EduStoreBase {
  //observers
  //actions
  //computes
  //others
  async startRecording() {
    try {
      const { sessionInfo, recordUrl, rteEngineConfig } = EduClassroomConfig.shared;
      await this.classroomStore.api.updateRecordingState({
        roomUuid: sessionInfo.roomUuid,
        state: 1,
        url: `${recordUrl}?language=${rteEngineConfig.language}`,
      });
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_START_RECORDING_FAIL,
        error as Error,
      );
    }
  }

  async stopRecording() {
    try {
      const { sessionInfo } = EduClassroomConfig.shared;
      await this.classroomStore.api.updateRecordingState({
        roomUuid: sessionInfo.roomUuid,
        state: 0,
      });
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_STOP_RECORDING_FAIL,
        error as Error,
      );
    }
  }

  onInstall() {}
  onDestroy() {}
}
