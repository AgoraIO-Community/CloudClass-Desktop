import { AGEventEmitter } from 'agora-rte-sdk';

export const AgoraEduClassRoomUIType = 'classroom-ui-events';

export enum AgoraEduClassroomUIEvent {
  offStreamWindow = 'off-stream-window',
  streamWindowsChange = 'stream-window-change',
  toggleTeacherStreamWindow = 'toggle-teacher-stream-window',
  hiddenStage = 'hidden-stage',
  toggleWhiteboard = 'toggle-whiteboard',
  dragFileOverBoard = 'drag-file-over-board',
  dropFileOnBoard = 'drop-file-on-board',
}

type EventCallback = (type: AgoraEduClassroomUIEvent, ...args: any[]) => void;

export class EduEventUICenter extends AGEventEmitter {
  static shared: EduEventUICenter = new EduEventUICenter();
  private _callbacks: Set<EventCallback> = new Set();
  constructor() {
    super();
  }

  emitClassroomUIEvents(type: AgoraEduClassroomUIEvent, ...args: any[]) {
    this.emit(AgoraEduClassRoomUIType, type, ...args);
  }

  onClassroomUIEvents(cb: EventCallback) {
    if (this._callbacks.has(cb)) {
      return;
    }
    this._callbacks.add(cb);
    this.on(AgoraEduClassRoomUIType, cb);
  }

  offClassroomUIEvents(cb: EventCallback) {
    this._callbacks.delete(cb);
    this.off(AgoraEduClassRoomUIType, cb);
  }

  cleanup() {
    this._callbacks.forEach((cb) => {
      this.offClassroomUIEvents(cb);
    });
  }
}
