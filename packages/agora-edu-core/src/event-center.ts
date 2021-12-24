import { AGEventEmitter } from 'agora-rte-sdk';
import { AgoraEduClassroomEvent, AgoraEduEventType } from './type';

export class EduEventCenter extends AGEventEmitter {
  static shared: EduEventCenter = new EduEventCenter();
  constructor() {
    super();
  }

  emitClasroomEvents(type: AgoraEduClassroomEvent, ...args: any[]) {
    this.emit(AgoraEduEventType.classroomEvents, type, ...args);
  }

  onClassroomEvents(cb: (type: AgoraEduClassroomEvent, ...args: any[]) => void) {
    this.on(AgoraEduEventType.classroomEvents, cb);
  }

  offClassroomEvents(cb: (type: AgoraEduClassroomEvent, ...args: any[]) => void) {
    this.off(AgoraEduEventType.classroomEvents, cb);
  }
}
