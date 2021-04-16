import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../../stores/base';

export type UserInfo = {

}

export type UserListModel = {
  teacherName: string,
  isDraggable: boolean,
  localUser: UserInfo,
  remoteUsers: UserInfo[],
}

export const defaultModel: UserListModel = {
  teacherName: '',
  isDraggable: false,
  localUser: {},
  remoteUsers: [],
}

export interface UserListTraits {
  revokeCoVideo(uid: string): Promise<unknown>;
  grantCoVideo(uid: string): Promise<unknown>;
  revokeBoardPermission(uid: string): Promise<unknown>;
  grantBoardPermission(uid: string): Promise<unknown>;
  muteVideo(uid: string, isLocal: boolean): Promise<unknown>;
  unmuteVideo(uid: string, isLocal: boolean): Promise<unknown>;
}

type UserListUIKitModule = UIKitBaseModule<UserListModel, UserListTraits>

export abstract class UserListUIKitStore extends BaseStore<UserListModel> implements UserListUIKitModule {
  get teacherName () {
    return this.attributes.teacherName
  }
  get isDraggable () {
    return this.attributes.isDraggable
  }
  get localUser () {
    return this.attributes.localUser
  }
  get remoteUsers () {
    return this.attributes.remoteUsers
  }
  abstract revokeCoVideo(uid: string): Promise<unknown>;
  abstract grantCoVideo(uid: string): Promise<unknown>;
  abstract revokeBoardPermission(uid: string): Promise<unknown>;
  abstract grantBoardPermission(uid: string): Promise<unknown>;
  abstract muteVideo(uid: string, isLocal: boolean): Promise<unknown>;
  abstract unmuteVideo(uid: string, isLocal: boolean): Promise<unknown>;
}