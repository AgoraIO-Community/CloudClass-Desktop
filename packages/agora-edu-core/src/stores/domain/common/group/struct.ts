import { AGEventEmitter } from 'agora-rte-sdk';
import { EduClassroomConfig } from '../../../../configs';

export class SubRoom extends AGEventEmitter {
  constructor(private _roomConfig: EduClassroomConfig) {
    super();
  }
  get roomConfig() {
    return this._roomConfig;
  }
}
