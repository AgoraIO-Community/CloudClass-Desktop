import { computed } from 'mobx';
import { RosterUIStore } from '../common/roster';

export class StudyRoomRosterUIStore extends RosterUIStore {
  get uiOverrides() {
    return { ...super.uiOverrides, width: 400 };
  }

  @computed
  get rosterFunctions() {
    return ['search', 'pin', 'eye'] as ('search' | 'pin' | 'eye')[];
  }
}
