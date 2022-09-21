import { getTokenDomain } from '@/app/utils/env';
import { request, Response } from '@/app/utils/request';
import { EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { getRegion } from '../stores/home';
import { UserApi } from './user';

export enum RoomState {
  NO_STARTED,
  GOING,
  ENDED,
}

export type RoomInfo = {
  roomName: string;
  roomId: string;
  roomType: EduRoomTypeEnum;
  roomState: RoomState;
  startTime: number;
  endTime: number;
  roomProperties: RoomProperties;
};

type ListRequest = {
  nextId?: string;
  count?: number;
};
type ListResponse = {
  total: number;
  nextId: string;
  count: number;
  list: RoomInfo[];
};
type RoomProperties = Record<string, any>;
type CreateRoomRequest = {
  roomName: string;
  roomType: EduRoomTypeEnum;
  startTime: number;
  endTime: number;
  roomProperties?: RoomProperties;
};
type CreateRoomResponse = {
  roomId: string;
};

type JoinRoomRequest = {
  roomId: string;
  role: EduRoleTypeEnum;
};

export type JoinRoomResponse = {
  token: string;
  appId: string;
  roomDetail: RoomInfo;
};

export class RoomAPI {
  static shared = new RoomAPI();

  get domain() {
    return getTokenDomain(getRegion());
  }

  /**
   * 获取教室列表
   * @param params
   * @returns
   *
   **/
  /** @en
   * Gets room list
   * @param params
   * @returns
   */
  async list(params?: ListRequest) {
    const data = {
      count: 15,
      ...params,
    };
    const url = `${this.domain}/edu/companys/${UserApi.shared.userInfo?.companyId}/v1/rooms?count=${
      data.count
    }${data.nextId ? `&nextId=${data.nextId}` : ''}`;
    return request.get<Response<ListResponse>>(url);
  }

  async allList() {
    const count = 100;
    const response = await this.list({ count });
    const result = response.data.data;
    while (result.total > result.count) {
      const response = await this.list({ count, nextId: result.nextId });
      const { data } = response.data;
      result.list.push(...data.list);
      result.nextId = data.nextId;
      result.count = result.count + data.count;
    }
    return result;
  }

  /**
   * 创建教室
   * @param params
   * @returns
   *
   **/
  /** @en
   * Create room
   * @param params
   * @returns
   */
  async create(params: CreateRoomRequest) {
    const url = `${this.domain}/edu/companys/${UserApi.shared.userInfo?.companyId}/v1/rooms`;
    return request.post<Response<CreateRoomResponse>>(url, params);
  }

  /**
   * 通过房间ID查询房间信息
   * @param roomID
   * @returns
   *
   **/
  /** @en
   * Get room's info by id
   * @param roomID
   * @returns
   */
  async getRoomInfoByID(roomID: string) {
    const url = `${this.domain}/edu/companys/${UserApi.shared.userInfo?.companyId}/v1/rooms/${roomID}`;
    return request.get<Response<RoomInfo>>(url);
  }

  /**
   * 加入教室
   * @param params
   * @returns
   *
   **/
  /** @en
   * Join room
   * @param params
   * @returns
   */
  async join(params: JoinRoomRequest) {
    const url = `${this.domain}/edu/companys/${UserApi.shared.userInfo?.companyId}/v1/rooms`;
    return request.put<Response<JoinRoomResponse>>(url, params);
  }

  /**
   * 教室历史查询
   * @param roomID
   * @returns
   *
   **/
  /** @en
   * Get history of the room
   * @param roomID
   * @returns
   */
  async history(roomID: string) {
    const url = `${this.domain}/edu/v2/rooms/${roomID}/history`;
    return request.get<Response<any>>(url);
  }
}
