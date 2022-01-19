import { bound } from 'agora-rte-sdk';
import { EduClassroomStore } from '..';
import { TrackData, TrackState } from '../room/type';
import { TrackAdapter } from '../track/type';

export class WidgetTrackAdapter implements TrackAdapter {
  constructor(private _classroomStore: EduClassroomStore) {}
  @bound
  updateTrackState(trackId: string, trackData: TrackData) {
    this._classroomStore.widgetStore.setActive(trackId, trackData, trackData.extra.userUuid);
  }
  @bound
  deleteTrackState(trackId: string) {
    this._classroomStore.widgetStore.setInactive(trackId);
  }

  get trackState(): TrackState {
    return this._classroomStore.widgetStore.widgetsTrackState;
  }
}
