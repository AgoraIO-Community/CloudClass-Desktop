import { computed } from 'mobx';
import { RosterUIStore } from 'agora-edu-core';

export class LectureRosterUIStore extends RosterUIStore {
  uiOverrides = { width: 400 };
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
