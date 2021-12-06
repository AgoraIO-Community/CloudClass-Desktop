import { isEqual } from 'lodash';
import { EduClassroomConfig } from '../../../../configs';
import { EduEventCenter } from '../../../../event-center';
import { AgoraEduInteractionEvent, EduRoleTypeEnum } from '../../../../type';
import { RteRole2EduRole } from '../../../../utils';
import { EduUser } from '../user/struct';
import { TrackState } from './type';

export type Progress = {
  userUuid: string;
  ts: number;
};

export enum CoVideoAction {
  studentHandsUp = 1,
  teacherAccept = 2,
  teacherRefuse = 3,
  studentCancel = 4,
  studentOffStage = 6,
  teacherReplayTimeout = 7,
  carousel = 10,
}

type Operator = {
  role: string;
  userName: string;
  userUuid: string;
};

type Cause = {
  cmd: number;
  data: {
    processUuid: string;
    addProgress: Progress[];
    addAccepted: Progress[];
    removeProgress: Progress[];
    removeAccepted: Progress[];
    actionType: CoVideoAction;
    cmd: number;
    extAppCause: any;
  };
};

type Delegate = {
  fireExtAppDidUpdate(apps: Record<string, any>, extAppCause: any): void;
  fireWidgetsTrackStateChange(trackState: TrackState): void;
  fireExtappsTrackStateChange(trackState: TrackState): void;
  getUserById(userUuid: string): EduUser | undefined;
};

export const escapeExtAppIdentifier = (appIdentifier: string, inverse?: boolean) => {
  return inverse ? appIdentifier.replace(/_/g, '.') : appIdentifier.replace(/\./g, '_');
};

const createClosure = () => {
  let cacheRegistry: any = {};

  return {
    prev(key: string) {
      return cacheRegistry[key];
    },
    next(key: string, value: any) {
      cacheRegistry[key] = value;
    },
  };
};

class CMDHandler {
  cache = createClosure();
  extApps: any = {};

  constructor(private _delegate: Delegate) {}

  exec(operator: Operator, cause: Cause, changedProperties: any) {
    // cause may be undefined at first time
    const { cmd, data } = cause || {};
    if (cmd === 501) {
      this.handleHandup(operator, data, changedProperties);
    } else if (cmd === 7) {
      this.handleExtAppEvents(data, changedProperties);
    } else if (cmd === 1101) {
      this.handleReward(data, changedProperties);
    }
    this.handleUpdateTrackState(changedProperties);
  }

  private handleHandup(operator: Operator, data: Cause['data'], changedProperties: any) {
    const process = data.processUuid;
    const {
      sessionInfo: { userUuid, roomType },
    } = EduClassroomConfig.shared;
    if (process === 'handsUp') {
      switch (data.actionType) {
        case CoVideoAction.teacherAccept: {
          if (
            data.addAccepted.findIndex(
              (item: { userUuid: string }) => item.userUuid === userUuid,
            ) !== -1 &&
            RteRole2EduRole(roomType, operator.role) === EduRoleTypeEnum.teacher
          ) {
            EduEventCenter.shared.emitInteractionEvents(AgoraEduInteractionEvent.UserAcceptToStage);
          }
          break;
        }
        case CoVideoAction.studentOffStage: {
          if (
            data.removeAccepted.findIndex(
              (item: { userUuid: string }) => item.userUuid === userUuid,
            ) !== -1 &&
            RteRole2EduRole(roomType, operator.role) === EduRoleTypeEnum.teacher
          ) {
            EduEventCenter.shared.emitInteractionEvents(AgoraEduInteractionEvent.UserLeaveStage);
          }
          break;
        }
        //   case CoVideoAction.studentHandsUp: {
        //     if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(userRole)) {
        //       // this.toast('co_video.received_student_hands_up');
        //     }
        //     break;
        //   }
        //   case CoVideoAction.teacherRefuse: {
        //     if ([EduRoleTypeEnum.student].includes(userRole)) {
        //       const includedRemoveProgress: Progress[] = data?.removeProgress ?? [];
        //       if (includedRemoveProgress.find((it) => it.userUuid === userUuid)) {
        //         // this.toast('co_video.received_teacher_refused');
        //       }
        //     }
        //     break;
        //   }
        //   case CoVideoAction.studentCancel: {
        //     if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(userRole)) {
        //       // this.toast('co_video.received_student_cancel');
        //     }
        //     break;
        //   }
      }
    }
  }

  private handleReward(data: Cause['data'], changedProperties: any) {
    let rewardData = data as any;
    let userUuids = Object.keys(data);
    let userNames: string[] = [];

    userUuids.forEach((uid) => {
      if (!rewardData[uid]) {
        return;
      }

      const user = this._delegate.getUserById(uid);

      if (user) {
        userNames.push(user.userName);
      }
    });
    EduEventCenter.shared.emitInteractionEvents(
      AgoraEduInteractionEvent.RewardReceived,
      userNames.join(','),
    );
  }

  private handleExtAppEvents(data: Cause['data'], changedProperties: any) {
    // fire did update event when app properties actually changed
    const { extAppCause } = data;
    const apps: Record<string, any> = {};
    const extApps = changedProperties.extApps;

    Object.keys(extApps).forEach((key) => {
      const oldProps = this.extApps[key];
      const newProps = extApps[key];

      if (!isEqual(oldProps, newProps)) {
        apps[key] = newProps;
      }
    });
    this.extApps = extApps;
    this._delegate.fireExtAppDidUpdate(apps, extAppCause);
  }

  private handleUpdateTrackState(changedProperties: any) {
    if (changedProperties.widgets) {
      // const next = cloneDeep(changedProperties.widgets);
      const next = changedProperties.widgets;
      const prev = this.cache.prev('widgets');

      const rawPrev = JSON.stringify(prev);
      const rawNext = JSON.stringify(next);

      // prevent unnecessary re-rendering
      if (rawPrev !== rawNext) {
        this.cache.next('widgets', next);

        this._delegate.fireWidgetsTrackStateChange(next);
      }
    }
  }
}

export default CMDHandler;
