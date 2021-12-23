import { AgoraRteEngine, bound, Logger, Scheduler } from 'agora-rte-sdk';
import { AgoraEduClassroomEvent, EduClassroomConfig, EduEventCenter } from '.';

export class LogReporter {
  private static readonly UPLOAD_PERIOD_IN_SECONDS = 1000 * 60 * 10;
  private static _reporter = new LogReporter();
  private _task?: Scheduler.Task;
  private _lastUploadTs = 0;
  private _isProcessing = false;

  start() {
    this._task = Scheduler.shared.addIntervalTask(
      this.execute.bind(this),
      Scheduler.Duration.second(1),
    );
  }

  stop() {
    this._task?.stop();
  }

  get _isTimeToUpload() {
    return Date.now() - this._lastUploadTs > LogReporter.UPLOAD_PERIOD_IN_SECONDS;
  }

  private async execute() {
    if (this._isProcessing || !this._isTimeToUpload) {
      return;
    }
    try {
      this._isProcessing = true;
      const { roomUuid, roomName, roomType, userUuid, userName, role } =
        EduClassroomConfig.shared.sessionInfo;

      // upload
      await AgoraRteEngine.engine.uploadSDKLogToAgoraService({
        roomUuid,
        roomName,
        roomType,
        userUuid,
        userName,
        role,
      });
      this._lastUploadTs = Date.now();
      this._isProcessing = false;
    } catch (e) {
      Logger.info('Failed to collect logs', e);
    }
  }

  static enableLogReport() {
    EduEventCenter.shared.onClassroomEvents((event) => {
      if (event === AgoraEduClassroomEvent.ready) {
        LogReporter._reporter.start();
      } else if (event === AgoraEduClassroomEvent.destroyed) {
        LogReporter._reporter.stop();
      }
    });
  }
}

//@ts-ignore
window.logReporter = new LogReporter();
