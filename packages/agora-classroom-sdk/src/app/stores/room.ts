import { ToastType } from '@/infra/stores/common/share-ui';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { action, autorun, observable } from 'mobx';
import { aMessage, transI18n } from '~ui-kit';
import {
  roomApi,
  RoomCreateRequest,
  RoomInfo,
  RoomJoinNoAuthRequest,
  RoomJoinRequest,
} from '../api/room';
import { ErrorCode, getErrorMessage } from '../utils/error';
import { getLSStore, LS_LAST_JOINED_ROOM_ID, setLSStore } from '../utils/local-storage';

type RoomToastType = ToastType;
export class RoomStore {
  constructor() {
    autorun(() => {
      setLSStore(LS_LAST_JOINED_ROOM_ID, this.lastJoinedRoomId);
    });
  }
  @observable
  public fetching = false;

  @observable
  public total = 0;

  @observable
  public nextId: string | undefined = undefined;

  @observable
  public lastJoinedRoomId: string = getLSStore<string>(LS_LAST_JOINED_ROOM_ID) || '';

  public rooms = observable.map<string, RoomInfo>();

  @observable
  roomToastList: RoomToastType[] = [];
  @action.bound
  addRoomToast(toast: RoomToastType) {
    this.roomToastList.push(toast);
  }

  @action.bound
  removeRoomToast(id: RoomToastType['id']) {
    this.roomToastList = this.roomToastList.filter((it) => it.id != id);
  }

  @action.bound
  private setTotal(total: number): void {
    this.total = total;
  }

  @action.bound
  public setLastJoinedRoomId(id: string): void {
    this.lastJoinedRoomId = id;
  }

  @action.bound
  private setNextId(nextId: string | undefined): void {
    this.nextId = nextId;
  }
  @action.bound
  private setFetching(fetching: boolean): void {
    this.fetching = fetching;
  }
  @action.bound
  public async clearRooms() {
    this.rooms.clear();
    this.setNextId(undefined);
    this.setTotal(0);
  }

  @action.bound
  public async createRoom(params: RoomCreateRequest) {
    const {
      data: { data },
    } = await roomApi.create(params);
    const toast: RoomToastType = {
      id: data.roomId,
      type: 'success',
      desc: transI18n('fcr_create_tips_create_success'),
    };
    this.addRoomToast(toast);
    setTimeout(() => {
      this.removeRoomToast(data.roomId);
    }, 4000);
    return data;
  }

  @action.bound
  public async refreshRoomList() {
    this.setFetching(true);
    try {
      const {
        data: { data },
      } = await roomApi.list();
      const { list, nextId, total } = data;
      this.setNextId(nextId);
      this.setTotal(total);
      this.rooms.clear();
      for (const room of list) {
        this.updateRoom(room.roomId, room);
      }
      this.setFetching(false);
      return data;
    } catch {
      this.setFetching(false);
      return Promise.reject('refresh room list api failed');
    }
  }

  @action.bound
  public async fetchMoreRoomList() {
    this.setFetching(true);
    try {
      const {
        data: { data },
      } = await roomApi.list({ nextId: this.nextId });
      const { list, nextId, total } = data;
      this.setTotal(total);
      this.setNextId(nextId);
      for (const room of list) {
        this.updateRoom(room.roomId, room);
      }
      this.setFetching(false);
      return data;
    } catch {
      this.setFetching(false);
      return Promise.reject('refresh room list api failed');
    }
  }

  @action.bound
  public updateRoom(roomId: string, roomInfo: RoomInfo): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const keys = Object.keys(roomInfo) as unknown as Array<keyof RoomInfo>;
      for (const key of keys) {
        if (key !== 'roomId') {
          (room[key] as any) = roomInfo[key];
        }
      }
    } else {
      this.rooms.set(roomId, { ...roomInfo, roomId });
    }
  }

  @action.bound
  public async joinRoom(params: RoomJoinRequest) {
    return roomApi.join(params).catch((error) => {
      console.warn('join room api failed. error:%o', error);
      if (error?.response?.data?.code === ErrorCode.COURSE_HAS_ENDED) {
        aMessage.error(getErrorMessage(error?.response?.data?.code));
      } else {
        aMessage.error(transI18n('fcr_join_room_tips_empty_id'));
      }
      return error;
    });
  }

  @action.bound
  public async joinRoomNoAuth(params: RoomJoinNoAuthRequest) {
    return roomApi.joinNoAuth(params).catch((error) => {
      console.warn('join room no auth api failed. error:%o', error);
      if (error?.response?.data?.code === ErrorCode.COURSE_HAS_ENDED) {
        aMessage.error(getErrorMessage(error?.response?.data?.code));
      } else {
        aMessage.error(transI18n('fcr_join_room_tips_empty_id'));
      }
      return error;
    });
  }
}

export const roomStore = new RoomStore();
