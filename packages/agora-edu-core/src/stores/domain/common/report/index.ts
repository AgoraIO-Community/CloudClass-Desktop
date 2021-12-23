import { Logger, RtcState } from 'agora-rte-sdk';
import { computed, Lambda, reaction } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { ReportServiceV2 } from '../../../../services/report-v2';
import { ClassroomState } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';

export class ReportStore extends EduStoreBase {
  private _disposers: Lambda[] = [];

  get currentTime() {
    return new Date().getTime();
  }

  onInstall(): void {
    this._disposers.push(
      reaction(
        () =>
          computed(() => ({
            screenShareStreamUuid: this.classroomStore.roomStore.screenShareStreamUuid,
            localShareStreamUuid: this.classroomStore.streamStore.localShareStreamUuid,
          })).get(),
        (value) => {
          const { screenShareStreamUuid, localShareStreamUuid } = value;
          if (screenShareStreamUuid) {
            if (screenShareStreamUuid === localShareStreamUuid) {
              ReportServiceV2.shared.reportScreenShareStart(this.currentTime, 0);
            }
          } else {
            if (screenShareStreamUuid === localShareStreamUuid) {
              ReportServiceV2.shared.reportScreenShareEnd(this.currentTime, 0);
            }
          }
        },
      ),
    );

    EduErrorCenter.shared.on('error', (code: string) => {
      if (code === AGEduErrorCode.EDU_ERR_MEDIA_START_SCREENSHARE_FAIL) {
        ReportServiceV2.shared.reportScreenShareStart(this.currentTime, +code);
      } else if (code === AGEduErrorCode.EDU_ERR_MEDIA_STOP_SCREENSHARE_FAIL) {
        ReportServiceV2.shared.reportScreenShareEnd(this.currentTime, +code);
      }
    });

    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.classroomState).observe(
        ({ oldValue, newValue }) => {
          if (oldValue === ClassroomState.Reconnecting && newValue === ClassroomState.Connected) {
            ReportServiceV2.shared.reportApaasUserReconnect(this.currentTime, 0);
          }
        },
      ),
    );

    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.rtcState).observe(
        ({ oldValue, newValue }) => {
          if (oldValue === RtcState.Idle && newValue === RtcState.Connecting) {
            let vid = this.classroomStore.connectionStore.checkInData?.vid;
            let scene = this.classroomStore.connectionStore.scene;

            if (!vid || !scene) {
              return Logger.warn(
                `no vid/scene when initializing report params, report data may be inaccurate`,
              );
            }

            let createdTs = scene.createTs;
            if (!createdTs) {
              return Logger.warn(`no scene created ts, report data may be inaccurate`);
            }

            let streamUuid = scene.localUser?.streamUuid || '0';

            if (vid && scene) {
              //initialize rtc connection
              const { sessionInfo } = EduClassroomConfig.shared;
              const userRoleMap: Record<number, string> = {
                '-1': 'none',
                '0': 'invisible',
                '1': 'teacher',
                '2': 'student',
                '3': 'assistant',
              };
              let reportUserParams = {
                vid,
                ver: EduClassroomConfig.getVersion(),
                scenario: 'education',
                uid: sessionInfo.userUuid,
                userName: sessionInfo.userName,
                /**
                 * rtc流id
                 */
                streamUid: +streamUuid,
                streamSuid: streamUuid,
                /**
                 * apaas角色
                 */
                role: userRoleMap[sessionInfo.role],
                /**
                 * rtc sid
                 */
                streamSid: scene.rtcSid,
                /**
                 * rtm sid
                 */
                rtmSid: scene.rtmSid,
                /**
                 * apaas房间id，与rtc/rtm channelName相同
                 */
                roomId: sessionInfo.roomUuid,
                /**
                 * 房间创建的时间戳
                 */
                roomCreateTs: createdTs,
              };
              ReportServiceV2.shared.initReportUserParams(reportUserParams);
            }
          } else if (oldValue === RtcState.Connecting && newValue === RtcState.Connected) {
            //connected
            ReportServiceV2.shared.reportApaasUserJoin(this.currentTime, 0);
          } else if (oldValue === RtcState.Connected && newValue === RtcState.Idle) {
            //disconnected
            ReportServiceV2.shared.reportApaasUserQuit(this.currentTime, 0);
          }
        },
      ),
    );
  }
  onDestroy(): void {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
