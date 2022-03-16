import { bound } from 'agora-rte-sdk';
import { EduClassroomStore } from '..';
import { TrackData, TrackState } from '../room/type';
import { TrackAdapter } from '../track/type';

export class ExtAppTrackAdapter implements TrackAdapter {
  constructor(private _classroomStore: EduClassroomStore) {}
  @bound
  updateTrackState(trackId: string, trackData: TrackData) {
    const { size, ...data } = trackData;
    this._classroomStore.extensionAppStore.updateExtappTrackState(trackId, data);
  }
  @bound
  deleteTrackState(trackId: string) {
    this._classroomStore.extensionAppStore.deleteExtappTrackState(trackId);
  }

  get trackState(): TrackState {
    return this._classroomStore.extensionAppStore.extappsTrackState;
  }
}
