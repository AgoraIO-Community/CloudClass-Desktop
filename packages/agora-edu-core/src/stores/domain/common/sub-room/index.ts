import { AGError, AgoraRteScene, Log } from 'agora-rte-sdk';
import { observable, _allowStateChangesInsideComputed } from 'mobx';
import { AGServiceErrorCode } from '../../../..';
import { EduApiService } from '../../../../services/api';
import { EduSessionInfo } from '../../../../type';
import { LeaveReason } from '../connection';
import { GroupStore } from '../group';
import { BoardStoreEach } from './board';
import { ConnectionStoreEach } from './connection';
import { StreamStoreEach } from './stream';
import { UserStoreEach } from './user';

/**
 * 负责功能：
 *  1.加入房间
 *  2.离开房间
 *  3.更新子房间属性
 *  4.删除子房间属性
 *  5.房间属性
 *  6.Widgets
 *  7.Streams
 *  8.Users
 *
 */
@Log.attach({ proxyMethods: false })
export class SubRoomStore {
  private _classRoomGroupStore: GroupStore;

  private _sessionInfo: EduSessionInfo;

  private _api: EduApiService = new EduApiService();

  @observable userStore!: UserStoreEach;

  @observable connectionStore!: ConnectionStoreEach; // 为 subroom 提供 rte 链接

  @observable boardStore!: BoardStoreEach; // 创建白板

  @observable streamStore!: StreamStoreEach; // media control

  @observable scene?: AgoraRteScene; //

  constructor(store: GroupStore, sessionInfo: EduSessionInfo) {
    this._classRoomGroupStore = store;
    this._sessionInfo = sessionInfo;
    this.initialize();
  }

  get sessionInfo() {
    return this._sessionInfo;
  }

  get api() {
    return this._api;
  }

  initialize = () => {
    this.connectionStore = new ConnectionStoreEach(this);
    this.userStore = new UserStoreEach(this);
    this.boardStore = new BoardStoreEach(this);
    this.streamStore = new StreamStoreEach(this);
  };

  /**
   * 加入子房间
   * ⭐ TODO 退订大房间的流信息，并且断开流的发布 🍅
   */
  joinSubRoom = () => {
    const { joinClassroom, joinRTC } = this.connectionStore;
    // _addEventHandlers
    return new Promise((joinSubRoomResolve, joinSubRoomReject) => {
      joinClassroom()
        .then(() => {
          joinRTC().catch((e) => {
            return joinSubRoomReject(e);
          });
        })
        .catch((e) => {
          if (AGError.isOf(e, AGServiceErrorCode.SERV_CANNOT_JOIN_ROOM)) {
            this.connectionStore.leaveClassroom(LeaveReason.kickOut);
          } else {
            this.connectionStore.leaveClassroomUntil(
              LeaveReason.leave,
              new Promise((resolve) => {
                joinSubRoomResolve({ error: e, resovle: resolve });
                // this.shareUIStore.addGenericErrorDialog(e as AGError, {
                //   onOK: resolve,
                //   okBtnText: transI18n('toast.leave_room'),
                // });
              }),
            );
          }
          joinSubRoomReject(e);
        });
    });
  };

  /**
   * 离开子房间
   * 彻底 distory 小房间的rtc rtm channel
   */
  leaveSubRoom = async () => {
    try {
      await this.connectionStore.leaveClassroom(LeaveReason.leave);
      this.streamStore.onDestroy();
      this.boardStore.onDestroy();
    } catch (e) {
      return e;
    }
  };

  /**
   * 获取子房间消息
   */

  getSubRoomInfo() {}

  /**
   * 获取子房间自定义属性
   */
  getSubRoomProperties() {}

  /**
   * 更新子房间自定义属性(Flex) TODO
   */
  updateSubRoomProperties() {
    return 'todo';
  }

  /**
   * 删除房间自定义属性(Flex)
   */
  deleteSubRoomProperties() {
    return 'todo';
  }
}
