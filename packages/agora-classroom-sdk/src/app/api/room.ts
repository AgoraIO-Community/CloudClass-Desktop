import { getTokenDomain } from '@/app/utils/env';
import { request, Response } from '@/app/utils/request';
import { EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { getRegion } from '../stores/global';
import { getLSStore, LS_COMPANY_ID } from '../utils/local-storage';

export enum RoomState {
  NO_STARTED,
  GOING,
  ENDED,
}

export type RoomInfo = {
  roomName: string;
  creatorId: string;
  roomId: string;
  roomType: EduRoomTypeEnum;
  roomState: RoomState;
  startTime: number;
  endTime: number;
  industry?: string;
  roleConfig?: Record<number, number>;
  roomProperties: RoomProperties;
  role: EduRoleTypeEnum; // 上次加入房间的角色
};

export type RoomListRequest = {
  nextId?: string;
  count?: number;
};

export type RoomListResponse = {
  total: number;
  nextId: string;
  count: number;
  list: RoomInfo[];
};
type RoomProperties = Record<string, any>;
export type RoomCreateRequest = {
  roomName: string;
  roomType: EduRoomTypeEnum;
  startTime: number;
  endTime: number;
  roomProperties?: RoomProperties;
};
type RoomCreateResponse = {
  roomId: string;
};

export type RoomJoinRequest = {
  roomId: string;
  role: EduRoleTypeEnum;
};

export type RoomJoinNoAuthRequest = RoomJoinRequest & {
  userUuid: string;
};

export type RoomJoinResponse = {
  token: string;
  appId: string;
  roomDetail: RoomInfo;
};

const noAuthCompanyID = 0;

export class RoomAPI {
  private get domain() {
    return getTokenDomain(getRegion());
  }

  private get companyId() {
    return getLSStore(LS_COMPANY_ID);
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
  public async list(params?: RoomListRequest) {
    const data = {
      count: 15,
      ...params,
    };
    const url = `${this.domain}/edu/companys/${this.companyId}/v1/rooms?count=${data.count}${
      data.nextId ? `&nextId=${data.nextId}` : ''
    }`;
    return request.get<Response<RoomListResponse>>(url);
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
  public async create(params: RoomCreateRequest) {
    const url = `${this.domain}/edu/companys/${this.companyId}/v1/rooms`;
    return request.post<Response<RoomCreateResponse>>(url, params);
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
  public async getRoomInfoByID(roomID: string) {
    const url = `${this.domain}/edu/companys/${this.companyId}/v1/rooms/${roomID}`;
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
  public async join(params: RoomJoinRequest) {
    const url = `${this.domain}/edu/companys/${this.companyId}/v1/rooms`;
    return request.put<Response<RoomJoinResponse>>(url, params);
  }

  /**
   * 加入教室(免鉴权)
   * @param params
   * @returns
   *
   **/
  /** @en
   * Join room without auth
   * @param params
   * @returns
   */
  public async joinNoAuth(params: RoomJoinNoAuthRequest) {
    const url = `${this.domain}/edu/companys/${noAuthCompanyID}/v1/rooms`;
    return request.put<Response<RoomJoinResponse>>(url, params);
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
  public async history(roomID: string) {
    const url = `${this.domain}/edu/v2/rooms/${roomID}/history`;
    return request.get<Response<any>>(url);
  }
}

export const roomApi = new RoomAPI();
