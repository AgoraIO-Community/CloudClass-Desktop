import { computed } from 'mobx';
import { RosterUIStore } from '../common/roster';

export class EduLectureRosterUIStore extends RosterUIStore {
  @computed
  get rosterFunctions() {
    const { canKickOut, canSearchInRoster } = this;
    const functions = [] as Array<
      'search' | 'carousel' | 'kick' | 'grant-board' | 'podium' | 'stars'
    >;
    if (canKickOut) {
      functions.push('kick');
    }
    if (canSearchInRoster) {
      functions.push('search');
    }
    return functions;
  }
}
