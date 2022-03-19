import { isEqual } from 'lodash';
import { EduClassroomConfig } from '../../../../configs';
import { EduEventCenter } from '../../../../event-center';
import { AgoraEduClassroomEvent, EduRoleTypeEnum } from '../../../../type';
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
  getCurrentSceneId(): string;
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

  exec(operator: Operator, cause: Cause, changedProperties: any, sceneId: string) {
    const currentSceneId = this._delegate.getCurrentSceneId();

    if (sceneId !== currentSceneId) {
      return;
    }

    // cause may be undefined at first time
    const { cmd, data } = cause || {};
    if (cmd === 501) {
      this.handleHandup(operator, data, changedProperties);
    } else if (cmd === 7) {
      this.handleExtAppEvents(data, changedProperties);
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
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.UserAcceptToStage);
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
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.UserLeaveStage);
          }
          break;
        }
      }
    }
  }

  private handleExtAppEvents(data: Cause['data'], changedProperties: any) {
    // fire did update event when app properties actually changed
    const { extAppCause } = data;
    const apps: Record<string, any> = {};
    const extApps = changedProperties.extApps;

    Object.keys(extApps).forEach((key) => {
      const filterTrackProps = (props: any) => {
        if (!props) {
          return props;
        }
        const { position, size, extra, ...otherProps } = props;

        return otherProps;
      };
      const oldProps = filterTrackProps(this.extApps[key]);
      const newProps = filterTrackProps(extApps[key]);

      if (!isEqual(oldProps, newProps)) {
        apps[key] = newProps;
      }
    });
    this.extApps = extApps;
    this._delegate.fireExtAppDidUpdate(apps, extAppCause);
  }

  private handleUpdateTrackState(changedProperties: any) {
    if (changedProperties.widgets) {
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

    if (changedProperties.extApps) {
      const next = changedProperties.extApps;
      const prev = this.cache.prev('extapps');

      const rawPrev = JSON.stringify(prev);
      const rawNext = JSON.stringify(next);

      // prevent unnecessary re-rendering
      if (rawPrev !== rawNext) {
        this.cache.next('extapps', next);

        this._delegate.fireExtappsTrackStateChange(next);
      }
    }
  }
}

export default CMDHandler;
