import { ApiBase, AgoraRteEngineConfig } from 'agora-rte-sdk';
import { CloudDriveResourceInfo } from '../stores/domain/common/cloud-drive/type';
import { EduSessionInfo, EduRoleTypeEnum } from '../type';
import { ClassState } from '../stores/domain/common/room/type';
import { escapeExtAppIdentifier } from '../stores/domain/common/room/command-handler';
import { EduClassroomConfig } from '..';
import { EduGroupDetail, EduPatchGroup } from '../stores/domain/common/group/struct';
import { GroupState } from '../stores/domain/common/group/type';
export class EduApiService extends ApiBase {
  async getConfig(): Promise<any> {
    const res = await this.fetch({
      path: `/v2/configs`,
      method: 'GET',
    });
    return res.data;
  }

  async checkIn(session: EduSessionInfo): Promise<any> {
    const {
      roomUuid,
      userUuid,
      role,
      roomName,
      roomType,
      userName,
      flexProperties,
      duration,
      startTime,
    } = session;
    let { data, ts } = await this.fetch({
      path: `/v3/rooms/${roomUuid}/users/${userUuid}`,
      method: 'PUT',
      data: {
        duration: duration,
        role: role,
        roomName: roomName,
        roomType: roomType,
        userName: userName,
        userProperties: flexProperties,
        startTime,
      },
    });
    return { data, ts };
  }

  // cloud drive apis
  async fetchPersonalResources(
    userUuid: string,
    options: {
      nextId?: string;
      tags?: string[];
      resourceName?: string;
      limit?: number;
      pageSize?: number;
      pageNo?: number;
      converted?: number;
      orderBy?: string;
    },
  ) {
    let queryparams: string[] = [];
    if (!options) {
      options = {};
    }
    options.orderBy = 'updateTime';
    let { data } = await this.fetch({
      path: `/v2/users/${userUuid}/resources/page${queryparams.join('&')}`,
      method: 'GET',
      query: options,
    });
    return data;
  }

  async removeMaterials(resourceUuids: string[], userUuid: string) {
    const finalData = resourceUuids.map((resourceUuid) => ({
      resourceUuid,
      userUuid,
    }));
    const { data } = await this.fetch({
      path: `/v2/resources/users`,
      method: 'DELETE',
      data: finalData,
    });
    return data;
  }

  async fetchFileUploadSts(
    roomUuid: string,
    {
      resourceUuid,
      resourceName,
      ext,
      size,
      conversion,
    }: {
      resourceUuid: string;
      resourceName: string;
      ext: string;
      size: number;
      conversion?: Object;
    },
  ) {
    const { data } = await this.fetch({
      path: `/v1/rooms/${roomUuid}/resources/${resourceUuid}/sts`,
      method: 'PUT',
      data: {
        resourceName,
        ext,
        size,
        conversion,
      },
    });
    return data;
  }

  async addCloudDriveFile(
    resourceUuid: string,
    userUuid: string,
    resourceInfo: CloudDriveResourceInfo,
  ) {
    let { data } = await this.fetch({
      path: `/v2/resources/${resourceUuid}`,
      method: 'PUT',
      data: {
        resourceName: resourceInfo.resourceName, //文件名
        size: resourceInfo.size, //文件大小
        ext: resourceInfo.ext, //扩展名 ppt、pptx、pptm、docx、doc、xlsx、xls、csv、pdf等
        url: resourceInfo.url, //网络地址
        conversion: resourceInfo.conversion,
        userUuids: [userUuid],
      },
    });
    return data;
  }

  async getHistoryChatMessage(params: {
    roomUuid: string;
    userUuid: string;
    data: {
      nextId: string;
      sort: number;
    };
  }) {
    const {
      data: { nextId, sort },
    } = params;
    const isNextId = nextId ? `nextId=${nextId}&` : '';
    const { data } = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/chat/messages?${isNextId}sort=${sort}`,
      method: 'GET',
    });
    return data;
  }

  async getConversationHistoryChatMessage(params: {
    roomUuid: string;
    data: {
      nextId: string;
      sort: number;
      studentUuid: string;
    };
  }) {
    const {
      data: { nextId, sort, studentUuid },
    } = params;
    const isNextId = nextId ? `nextId=${nextId}&` : '';
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/conversation/students/${studentUuid}/messages?${isNextId}sort=${sort}`,
      method: 'GET',
    });
    return res.data;
  }

  async getConversationList(params: {
    roomUuid: string;
    data: {
      nextId: string;
    };
  }) {
    const {
      data: { nextId },
    } = params;
    const isNextId = nextId ? `nextId=${nextId}&` : '';
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/conversation/students?nextId=${isNextId}`,
      method: 'GET',
    });
    return res.data;
  }

  async sendChat(params: {
    roomUuid: string;
    userUuid: string;
    data: {
      message: string;
      type: number;
    };
  }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/from/${params.userUuid}/chat`,
      method: 'POST',
      data: params.data,
    });
    return res.data;
  }

  async startCarousel(payload: any) {
    let res = await this.fetch({
      path: `/v2/rooms/${payload.roomUuid}/carousels/states/1`,
      method: 'put',
      data: {
        range: payload?.range ?? 1,
        type: payload?.type ?? 1,
        interval: payload?.interval ?? 10,
        count: 6,
      },
    });
    return res.data;
  }

  async sendConversationChat(params: {
    roomUuid: string;
    userUuid: string;
    data: {
      message: string;
      type: number;
    };
  }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/conversation/students/${params.userUuid}/messages`,
      method: 'POST',
      data: params.data,
    });
    return res.data;
  }
  async stopCarousel(payload: any) {
    let res = await this.fetch({
      path: `/v2/rooms/${payload.roomUuid}/carousels/states/0`,
      method: 'put',
    });
    return res.data;
  }

  async kickOutOnceOrBan(userUuid: string, isBan: boolean, roomUuid: string) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/users/${userUuid}/exit`,
      method: 'POST',
      data: {
        dirty: {
          state: isBan ? 1 : 0,
          duration: isBan ? 600 : 0,
        },
      },
    });
    return res.data;
  }

  async muteChat(params: { roomUuid: string; muteChat: number }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/mute`,
      method: 'PUT',
      data: {
        muteChat: params.muteChat,
      },
    });
    return res.data;
  }

  async sendRewards(params: {
    roomUuid: string;
    rewards: Array<{
      userUuid: string;
      changeReward: number;
    }>;
  }) {
    const apiVersion = EduClassroomConfig.shared.isLowAPIVersionCompatibleRequired ? 'v2' : 'v3';
    const res = await this.fetch({
      path: `/${apiVersion}/rooms/${params.roomUuid}/rewards`,
      method: 'POST',
      data: {
        rewardDetails: params.rewards,
      },
    });
    return res.data;
  }

  async handsUp(params: { roomUuid: string; toUserUuid: string; payload: any }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/handup/${params.toUserUuid}`,
      method: 'POST',
      data: {
        payload: JSON.stringify({
          cmd: 1,
          data: params.payload,
        }),
      },
    });
    return res.data;
  }

  async allowHandsUp(params: { roomUuid: string; state: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/${params.state}`,
      method: 'PUT',
    });
    return res.data;
  }

  async startHandsUp(params: {
    roomUuid: string;
    toUserUuid: string;
    timout?: number;
    retry?: boolean;
  }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'POST',
      data: {
        toUserUuid: params.toUserUuid,
        timeout: params.timout,
        retry: params.retry,
      },
    });
    return res.data;
  }

  async waveArm(params: {
    roomUuid: string;
    toUserUuid: string;
    timout?: number;
    retry?: boolean;
    payload?: object;
  }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/waveArm/progress`,
      method: 'POST',
      data: {
        toUserUuid: params.toUserUuid,
        timeout: params.timout,
        retry: params.retry,
        payload: params.payload,
      },
    });
    return res.data;
  }

  async dismissHandsUp(params: { roomUuid: string; toUserUuid: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'DELETE',
    });
    return res.data;
  }

  async cancelHandsUp(params: { roomUuid: string; toUserUuid?: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'DELETE',
      data: params.toUserUuid
        ? {
            toUserUuid: params.toUserUuid,
          }
        : null,
    });
    return res.data;
  }

  async acceptHandsUp(params: { roomUuid: string; toUserUuid: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'POST',
      data: {
        toUserUuid: params.toUserUuid,
      },
    });
    return res.data;
  }

  async refuseHandsUp(params: { roomUuid: string; toUserUuid: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'DELETE',
      data: {
        toUserUuid: params.toUserUuid,
      },
    });
    return res.data;
  }

  async revokeCoVideo(params: { roomUuid: string; toUserUuid?: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'DELETE',
      data: params.toUserUuid
        ? {
            toUserUuid: params.toUserUuid,
          }
        : null,
    });
    return res.data;
  }

  async revokeAllCoVideo(params: { roomUuid: string }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance/all`,
      method: 'DELETE',
    });
    return res.data;
  }

  async updateRecordingState(params: {
    roomUuid: string;
    state: number;
    videoBitrate?: number;
    backupCount?: number;
    url?: string;
  }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/records/states/${params.state}`,
      method: 'PUT',
      data: {
        mode: 'web',
        webRecordConfig: {
          rootUrl: params.url,
          videoBitrate: params.videoBitrate || 3000,
        },
        backupCount: params.backupCount || 0,
      },
    });
    return res.data;
  }

  async updateClassState(params: { roomUuid: string; state: ClassState }) {
    const res = await this.fetch({
      path: `/v2/rooms/${params.roomUuid}/states/${params.state}`,
      method: 'PUT',
    });
    return res.data;
  }

  async startShareScreen(roomId: string, userUuid: string) {
    const state = 1;
    const res = await this.fetch({
      path: `/v2/rooms/${roomId}/users/${userUuid}/screen/${state}`,
      method: 'PUT',
    });
    return res.data;
  }

  async stopShareScreen(roomId: string, userUuid: string) {
    const state = 0;
    const res = await this.fetch({
      path: `/v2/rooms/${roomId}/users/${userUuid}/screen/${state}`,
      method: 'PUT',
    });
    return res.data;
  }

  async updateWidgetProperties(roomUuid: string, widgetUuid: string, body: any) {
    let { data } = await this.fetch({
      path: `/v2/rooms/${roomUuid}/widgets/${widgetUuid}`,
      method: 'PUT',
      data: body,
    });
    return {
      data,
    };
  }

  async deleteWidgetProperties(roomUuid: string, widgetUuid: string, body: any) {
    let { data } = await this.fetch({
      path: `/v2/rooms/${roomUuid}/widgets/${widgetUuid}`,
      method: 'DELETE',
      data: body,
    });
    return {
      data,
    };
  }

  async updateExtAppProperties(
    roomId: string,
    extAppUuid: string,
    properties: any,
    common?: any,
    cause?: any,
  ) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomId}/extApps/${escapeExtAppIdentifier(extAppUuid)}/properties`,
      method: 'PUT',
      data: {
        properties,
        common,
        cause,
      },
    });
    return res.data;
  }

  async deleteExtAppProperties(
    roomId: string,
    extAppUuid: string,
    properties: string[],
    cause?: any,
  ) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomId}/extApps/${escapeExtAppIdentifier(extAppUuid)}/properties`,
      method: 'DELETE',
      data: {
        properties,
        cause,
      },
    });
    return res.data;
  }

  async updateFlexProperties(roomId: string, properties: any, cause: any) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomId}/properties`,
      method: 'PUT',
      data: {
        properties,
        cause,
      },
    });
    return res.data;
  }

  async reportMicCameraStateLeagcy(payload: {
    roomUuid: string;
    userUuid: string;
    data: any;
  }): Promise<any> {
    const res = await this.fetch({
      path: `/v2/rooms/${payload.roomUuid}/users/${payload.userUuid}/device`,
      method: 'PUT',
      data: payload.data,
    });
    return res.data;
  }

  async fetchUserList(
    roomId: string,
    params: {
      role: EduRoleTypeEnum;
      type?: '0' | '1';
      nextId: string | number | null | undefined;
      count?: number;
      userName?: string;
    },
  ) {
    const qs = [];

    const { role, type, nextId, count, userName } = params;

    if (role) {
      qs.push(`role=${role}`);
    }

    if (type) {
      qs.push(`type=${type}`);
    }

    if (userName) {
      qs.push(`userName=${userName}`);
    }

    if (nextId) {
      qs.push(`nextId=${nextId}`);
    }

    if (count) {
      qs.push(`count=${count}`);
    }

    const path = `/v2/rooms/${roomId}/users` + (qs ? `?${qs.join('&')}` : '');

    const res = await this.fetch({
      path,
      method: 'GET',
    });
    return res.data;
  }

  /**
   * 开启/关闭分组
   * @param roomUuid
   * @param state
   * @param data
   * @returns
   */
  async addSubRoomList(
    roomUuid: string,
    state: GroupState,
    data: { groups?: EduGroupDetail[]; inProgress?: boolean },
  ) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/groups/states/${state}`,
      method: 'PUT',
      data,
    });
    return res.data;
  }

  /**
   * 新增组
   * @param roomUuid
   * @param data
   * @returns
   */
  async addRoomList(roomUuid: string, data: { groups: EduGroupDetail[]; inProgress: boolean }) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/groups/states/1`,
      method: 'PUT',
      data,
    });
    return res.data;
  }

  /**
   * 删除组
   * @param roomUuid
   * @param data
   * @returns
   */
  async removeSubRoom(roomUuid: string, data: { removeGroupUuids: string[] }) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/groups/states/1`,
      method: 'DELETE',
      data,
    });
    return res.data;
  }

  /**
   * 接受邀请
   * @param roomUuid
   * @param groupUuid
   */
  async acceptSubRoomInvited(roomUuid: string, groupUuid: string) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/groups/${groupUuid}/acceptance`,
      method: 'POST',
    });
    return res.data;
  }

  /**
   *
   * @param roomUuid
   * @param data  🔢 inProgress 是否邀请，true 发送邀请 false 直接加入
   * @returns
   */
  async updateSubRoomUsers(
    roomUuid: string,
    data: { groups: EduPatchGroup[]; inProgress: boolean },
  ) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/groups/users`,
      method: 'PATCH',
      data,
    });
    return res.data;
  }

  /**
   * 发送全体消息
   * @param roomUuid
   * @param data
   * rang: 1.大房间 2.指定组 3.全体（大房间+所有组）
   * toGroupUuids: 当type=2时，传入指定小组id
   * type: 消息类型；txt:文本消息，img：图片消息，loc：位置消息，audio：语音消息，video：视频消息，file：文件消息
   * msg: 消息
   * @returns
   */
  async sendNotificationMessage(
    roomUuid: string,
    data: { rang: number; toGroupUuids: string[]; type: string; msg: string },
  ) {
    const res = await this.fetch({
      path: `/v2/rooms/${roomUuid}/widgets/easemobIM/messages`,
      method: 'PATCH',
      data,
    });
    return res.data;
  }
}
