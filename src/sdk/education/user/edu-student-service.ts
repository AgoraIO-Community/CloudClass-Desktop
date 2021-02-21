import { AgoraEduApi } from '../core/services/edu-api';
import { IEduUserService, EduUserService } from './edu-user-service';
import { EduStream, EduSubscribeOptions, EduUser } from '../interfaces';

export enum EduUserStateType {
  EduUserStateTypeVideo = 0,
  EduUserStateTypeAudio = 1,
  EduUserStateTypeChat = 2,
  EduUserStateTypeBoard = 3,
}

export enum NetworkQuality {
  NetworkQualityUnknown = -1,
  NetworkQualityHigh = 1,
  NetworkQualityMiddle = 2,
  NetworkQualityLow = 3
}

export declare function event_local_stream_added (stream: EduStream): void;
export declare function event_local_stream_updated (stream: EduStream): void;
export declare function event_local_stream_removed (stream: EduStream): void;

export declare interface IEduStudentService extends IEduUserService {
  on(event: "local-stream-added", listener: typeof event_local_stream_added): void
  on(event: "local-stream-updated", listener: typeof event_local_stream_updated): void
  on(event: "local-stream-removed", listener: typeof event_local_stream_removed): void
}
export class EduStudentService extends EduUserService implements IEduStudentService {
  // constructor(apiService: AgoraEduApi, user: EduUser) {
    // super(apiService);
    // this.updateLocalUser(user);
  // }
}