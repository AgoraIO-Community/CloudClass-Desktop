import { WindowID } from '@classroom/infra/api';
import {
  listenChannelMessage,
  sendToRendererProcess,
  transmitRTCRawData,
} from '@classroom/infra/utils/ipc';
import { ChannelType, IPCMessageType } from '@classroom/infra/utils/ipc-channels';
import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRteEngineConfig,
  EduRteRuntimePlatform,
  EduStream,
  iterateMap,
} from 'agora-edu-core';
import {
  AGError,
  AgoraRteVideoSourceType,
  AGRemoteVideoStreamType,
  bound,
  Log,
} from 'agora-rte-sdk';
import { action, computed, observable, reaction, toJS } from 'mobx';
import { EduUIStoreBase } from '../base';
import { DialogCategory } from '../share';
import { EduStreamUI } from '../stream/struct';
import { LayoutMaskCode } from '../type';

@Log.attach({ proxyMethods: true })
export class VideoGalleryUIStore extends EduUIStoreBase {
  private _disposers: (() => void)[] = [];
  readonly videoGalleryConfig = {
    '2x2': 4,
    '3x3': 9,
    '4x4': 16,
  };

  @observable
  curPage = 0;
  @observable
  pageSize = this.videoGalleryConfig['2x2'];
  @observable
  loading = false;
  @observable
  open = false;
  @observable
  externalOpen = false;
  @observable
  localPreview = false;

  @computed
  get stageUserUuids() {
    return this.getters.stageUsers.map(({ userUuid }) => userUuid);
  }

  @computed
  get videoGalleryConfigOptions() {
    return Object.entries(this.videoGalleryConfig).map(([k, v]) => ({
      text: k,
      value: v,
    }));
  }

  // which users should show in video grid
  @computed
  get allVideoUserList() {
    const { list } = iterateMap(this.classroomStore.userStore.studentList, {
      onMap(userUuid) {
        return userUuid;
      },
    });
    return list;
  }
  // how many page user can scroll
  @computed
  get totalPageNum() {
    const num = Math.ceil(this.allVideoUserList.length / this.pageSize);
    return num;
  }
  // which users show in video grid and publish
  @computed
  get curVideoUserList() {
    const startIndex = this.curPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.allVideoUserList.length);
    const list = this.allVideoUserList.slice(startIndex, endIndex);
    return list;
  }
  // streams of users which are scrolled into current page
  @computed
  get curStreamList() {
    const { streamByUserUuid, streamByStreamUuid } = this.classroomStore.streamStore;
    const { curVideoUserList } = this;
    const { list } = iterateMap(streamByUserUuid, {
      onMap(userUuid, streams) {
        let cameraStream: EduStream | undefined;
        streams.forEach((streamUuid) => {
          const stream = streamByStreamUuid.get(streamUuid);
          if (stream && stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
            cameraStream = stream;
          }
        });
        if (cameraStream) {
          return new EduStreamUI(cameraStream);
        }
        throw new Error(`Camera stream of user [${userUuid}] dose not existed.`);
      },
      onFilter(key, stream) {
        return stream && curVideoUserList.includes(key);
      },
    });

    return list;
  }
  // client user clicks next button
  @action.bound
  nextPage() {
    if (this.loading) {
      return;
    }
    this._setCurPage(this.curPage + 1);
  }
  // client user clicks previous button
  @action.bound
  prevPage() {
    if (this.loading) {
      return;
    }
    this._setCurPage(this.curPage - 1);
  }
  @action.bound
  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
  }

  @action.bound
  setOpen(open: boolean) {
    this.open = open;
  }

  // update user list and change open state
  @bound
  updateUsers(open: boolean, userList: string[]) {
    if (this.loading) {
      return;
    }
    this.logger.info('updateUsers', open, userList);
    this._setLoading(true);
    this.classroomStore.streamStore
      .updateExpandedScopeAndStreams(open ? 1 : 0, {
        userUuids: userList,
      })
      .catch(this.shareUIStore.addGenericErrorDialog)
      .finally(() => {
        this._setLoading(false);
      });
  }

  @action.bound
  openExternalWindow(direction: string) {
    this.shareUIStore.moveWindowAlignToWindow(WindowID.VideoGallery, WindowID.Main, {
      direction,
    });
    this.shareUIStore.showWindow(WindowID.VideoGallery);
    this.externalOpen = true;
  }

  @action.bound
  closeExternalWindow() {
    this.shareUIStore.hideWindow(WindowID.VideoGallery);
    this.externalOpen = false;
  }

  @action
  private _setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  private _setCurPage(curPage: number) {
    if (curPage >= this.totalPageNum || curPage < 0) {
      return;
    }

    this.curPage = curPage;
  }

  @action
  private _setLocalPreview(visible: boolean) {
    this.localPreview = visible;
  }

  @Log.silence
  private _rtcRawDataCallback = (info: unknown) => {
    // filter out raw data captured from local
    let rawArr = info as { uid: number }[];

    rawArr = rawArr.filter(({ uid }) => uid !== 0);

    if (rawArr.length) {
      transmitRTCRawData(WindowID.VideoGallery, rawArr);
    }
  };

  private _sendVideoGalleryState() {
    const options = toJS(this.videoGalleryConfigOptions);
    const streamList = this.curStreamList.map(({ stream, fromUser }) => {
      return { stream, fromUser: toJS(fromUser) };
    });
    const stageUserUuids = toJS(this.stageUserUuids);

    sendToRendererProcess(WindowID.VideoGallery, ChannelType.Message, {
      type: IPCMessageType.VideoGalleryStateUpdated,
      payload: {
        options,
        streamList,
        stageUserUuids,
        pageSize: this.pageSize,
        curPage: this.curPage,
        totalPageNum: this.totalPageNum,
      },
    });
  }

  onInstall() {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      // create a electron browser window when SDK launches,
      this.shareUIStore.openWindow(WindowID.VideoGallery, {
        options: {
          width: 500,
          height: 300,
          show: false,
          allowRendererProcessReuse: false,
          preventClose: true,
        },
      });

      this._disposers.push(
        reaction(
          () => this.externalOpen,
          (externalOpen) => {
            if (externalOpen) {
              //@ts-ignore
              this.classroomStore.connectionStore.scene.rtcChannel._adapter.base.rtcEngine.on(
                'agoraVideoRawData',
                this._rtcRawDataCallback,
              );
            } else {
              //@ts-ignore
              this.classroomStore.connectionStore.scene.rtcChannel._adapter.base.rtcEngine.off(
                'agoraVideoRawData',
                this._rtcRawDataCallback,
              );
            }
          },
        ),
      );

      this._disposers.push(
        listenChannelMessage(ChannelType.Message, (event, message) => {
          if (message.type == IPCMessageType.FetchVideoGalleryState) {
            this._sendVideoGalleryState();
          }
          if (message.type === IPCMessageType.UpdateVideoGalleryState) {
            const { payload } = message as { payload: any };
            if (payload?.curPage) {
              if (this.loading) {
                return;
              }
              this._setCurPage(payload.curPage);
            }
            if (payload?.pageSize) {
              this.setPageSize(payload.pageSize);
            }
          }
          if (message.type === IPCMessageType.BrowserWindowClose) {
            const { payload } = message as { payload: any };
            if (payload === WindowID.VideoGallery) {
              this.closeExternalWindow();
              this.shareUIStore.addDialog(DialogCategory.VideoGallery);
            }
          }
        }),
      );

      this._disposers.push(
        reaction(
          () => [this.curPage, this.pageSize, this.curStreamList, this.stageUserUuids],
          () => {
            this._sendVideoGalleryState();
          },
        ),
      );
      this._disposers.push(
        reaction(
          () => [this.curStreamList],
          () => {
            this.curStreamList.forEach(({ stream }) => {
              this.classroomStore.streamStore.setRemoteVideoStreamType(
                stream.streamUuid,
                AGRemoteVideoStreamType.LOW_STREAM,
              );
            });
          },
        ),
      );

      this._disposers.push(
        // when tool is opened, update layout
        reaction(
          () => [this.open],
          () => {
            if (!this.open) {
              this.closeExternalWindow();
            }
          },
        ),
      );
    }

    this._disposers.push(
      // when client user change page, the published user list should update
      reaction(
        () => [this.curVideoUserList, this.getters.videoGalleryOpened],
        () => {
          if (this.open && this.curVideoUserList.length) {
            this.updateUsers(true, this.curVideoUserList);
          }
        },
      ),
    );
    this._disposers.push(
      // when tool is opened, update layout
      reaction(
        () => [this.open],
        async () => {
          try {
            if (this.open) {
              await this.classroomStore.handUpStore.offPodiumAll();

              const area =
                (this.getters.layoutMaskCode & ~LayoutMaskCode.StageVisible) |
                LayoutMaskCode.VideoGalleryVisible;

              await this.classroomStore.roomStore.updateFlexProperties({
                properties: { area },
                cause: null,
              });
            } else {
              const area =
                (this.getters.layoutMaskCode & ~LayoutMaskCode.VideoGalleryVisible) |
                LayoutMaskCode.StageVisible;

              await this.classroomStore.roomStore.updateFlexProperties({
                properties: { area },
                cause: null,
              });
              this.updateUsers(false, []);
            }
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      ),
    );

    this._disposers.push(
      // if the local user dose not have a stream window and video grid tool is opened, show local camera preview at right bottom corner
      reaction(
        () => [
          this.getters.windowStreamUserUuids,
          this.getters.videoGalleryOpened,
          this.getters.stageVisible,
          this.stageUserUuids,
        ],
        () => {
          const { userUuid, role } = EduClassroomConfig.shared.sessionInfo;
          if (role === EduRoleTypeEnum.student) {
            const noStreamWindow = !this.getters.windowStreamUserUuids.includes(userUuid);
            const isOffStage = !this.stageUserUuids.includes(userUuid);

            if (this.getters.stageVisible) {
              this._setLocalPreview(this.getters.videoGalleryOpened && isOffStage);
            } else {
              this._setLocalPreview(this.getters.videoGalleryOpened && noStreamWindow);
            }
          }
        },
      ),
    );
  }
  onDestroy() {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      //@ts-ignore
      this.classroomStore.connectionStore.scene?.rtcChannel._adapter.base.rtcEngine.off(
        'agoraVideoRawData',
        this._rtcRawDataCallback,
      );
      this.shareUIStore.closeWindow(WindowID.VideoGallery);
    }
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
