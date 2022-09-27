import { observable, action, computed, runInAction, reaction } from 'mobx';
import { FetchUserParam, FetchUserType, EduRoleTypeEnum } from 'agora-edu-core';
import {
  AgoraRteMediaSourceState,
  AgoraRteMediaPublishState,
  Lodash,
  AGError,
} from 'agora-rte-sdk';
import { RosterUIStore } from '../common/roster';
import { DeviceState, Operations, Profile } from '../common/roster/type';
import { DialogCategory } from '../common/share-ui';
import { BoardGrantState } from '~components';

export class StudyRoomRosterUIStore extends RosterUIStore {
  get uiOverrides() {
    return { ...super.uiOverrides, width: 400 };
  }

  @computed
  get rosterFunctions() {
    const functions = [] as Array<
      'search' | 'carousel' | 'kick' | 'grant-board' | 'podium' | 'stars' | 'supervise-student'
    >;

    functions.push('search');

    return functions;
  }
}
