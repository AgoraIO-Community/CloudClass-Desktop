import { WindowID } from '@/infra/api';
import { listenChannelMessage, sendToRendererProcess } from '@/infra/utils/ipc';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomTypeEnum, iterateMap } from 'agora-edu-core';
import {
  AgoraRteEngineConfig,
  AgoraRteMediaSourceState,
  AgoraRteRuntimePlatform,
  AGScreenShareDevice,
  AGScreenShareType,
  bound,
} from 'agora-rte-sdk';
import { computed, reaction, toJS } from 'mobx';
import { EduUIStoreBase } from '../base';
import { DialogCategory } from '../share-ui';
import { mapToObject } from '@/infra/utils';
import { RemoteControlBarUIParams } from '../type';
import { ChannelType, IPCMessageType } from '@/infra/utils/ipc-channels';
import { ControlState } from './type';
import { transI18n } from '~ui-kit';

export class RemoteControlUIStore extends EduUIStoreBase {
  private _disposers: (() => void)[] = [];
  @computed
  get remoteControlToolBarActive() {
    return (
      (this.classroomStore.remoteControlStore.remoteControlRequesting ||
        this.classroomStore.remoteControlStore.isRemoteControlling) &&
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher
    );
  }
  @bound
  sendStudentListToRemoteControlBar() {
    const studentList = this.classroomStore.userStore.studentList;
    sendToRendererProcess(WindowID.RemoteControlBar, ChannelType.Message, {
      type: IPCMessageType.StudentListUpdated,
      payload: iterateMap(studentList, {
        onMap: (_key, item) => {
          const user = { ...item, userProperties: mapToObject(item.userProperties) };
          return user;
        },
      }).list,
    });
  }
  @bound
  openRemoteControlToolbar() {
    this.shareUIStore.openWindow(WindowID.RemoteControlBar, {
      options: {
        y: 0,
        width: RemoteControlBarUIParams.width,
        height: RemoteControlBarUIParams.height,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        resizable: false,
        hasShadow: false,
        focusable: true,
        backgroundColor: '#00000000',
        show: false,
      },
    });
  }
  @bound
  moveWindowToTargetScreen(shareDevice: AGScreenShareDevice | undefined) {
    shareDevice &&
      this.shareUIStore.moveWindowToTargetScreen(
        WindowID.RemoteControlBar,
        toJS(shareDevice.id) as string,
        {
          width: RemoteControlBarUIParams.width,
          height: RemoteControlBarUIParams.height,
        },
      );
  }
  @bound
  sendControlRequst(studentUuid: string) {
    const studentList = this.classroomStore.userStore.studentList;
    const student = studentList.get(studentUuid);
    if (student && this.classroomStore.remoteControlStore.isUserSupportedRemoteControl(student)) {
      this.classroomStore.remoteControlStore.sendControlRequst(studentUuid);
    } else {
      this.shareUIStore.addToast(
        transI18n('fcr_share_device_not_support', { reason: student?.userName }),
      );
    }
  }
  @bound
  closeRemoteControlToolbar() {
    this.shareUIStore.closeWindow(WindowID.RemoteControlBar);
  }
  onDestroy(): void {
    this._disposers.forEach((f) => f());
    this._disposers = [];
    if (
      AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron &&
      EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.RoomBigClass
    ) {
      if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher)
        this.closeRemoteControlToolbar();
    }
  }
  onInstall(): void {
    if (
      AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron &&
      EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.RoomBigClass
    ) {
      if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
        this.openRemoteControlToolbar();
        this._disposers.push(
          reaction(
            () => this.classroomStore.mediaStore.currentScreenShareDevice,
            this.moveWindowToTargetScreen,
          ),
        );
        this._disposers.push(
          reaction(
            () => this.classroomStore.remoteControlStore.isScreenSharingOrRemoteControlling,
            (isScreenSharingOrRemoteControlling) => {
              if (!isScreenSharingOrRemoteControlling)
                sendToRendererProcess(WindowID.RemoteControlBar, ChannelType.Message, {
                  type: IPCMessageType.ControlStateChanged,
                  payload: {
                    state: ControlState.NotAllowedControlled,
                  },
                });
            },
          ),
        );
        this._disposers.push(
          reaction(
            () => ({
              localScreenShareTrackState: this.classroomStore.mediaStore.localScreenShareTrackState,
              currentScreenShareDevice: this.classroomStore.mediaStore.currentScreenShareDevice,
            }),
            ({ localScreenShareTrackState, currentScreenShareDevice }) => {
              if (
                localScreenShareTrackState === AgoraRteMediaSourceState.started &&
                currentScreenShareDevice?.type === AGScreenShareType.Screen
              ) {
                this.shareUIStore.showWindow(WindowID.RemoteControlBar);
                this.sendStudentListToRemoteControlBar();
              } else {
                this.shareUIStore.hideWindow(WindowID.RemoteControlBar);
              }
            },
          ),
        );
      }
      if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student) {
        this._disposers.push(
          reaction(
            () => this.classroomStore.remoteControlStore.isHost,
            (isHost) => {
              if (isHost) {
                //被授权控制老师屏幕
                this.shareUIStore.addToast(transI18n('fcr_share_authorized_control'));
              } else {
                //取消授权控制老师屏幕
                this.shareUIStore.addToast(transI18n('fcr_share_forbidden_control'), 'warning');
              }
            },
          ),
        );
        this._disposers.push(
          reaction(
            () => this.classroomStore.remoteControlStore.isControlled,
            (isControlled) => {
              if (!isControlled) {
                //老师取消控制学生屏幕
                this.shareUIStore.addToast(transI18n('fcr_share_stopped_student_share'));
              }
            },
          ),
        );
      }

      this._disposers.push(
        listenChannelMessage(ChannelType.Message, async (event, message) => {
          switch (message.type) {
            case IPCMessageType.ControlStateChanged:
              const payload = message.payload as { state: string };
              if (payload.state === ControlState.NotAllowedControlled) {
                this.classroomStore.remoteControlStore.unauthorizeStudentToControl();
              } else {
                const studentUuid = payload.state as string;
                const studentList = this.classroomStore.userStore.studentList;
                const student = studentList.get(studentUuid);
                if (
                  student &&
                  this.classroomStore.remoteControlStore.isUserSupportedRemoteControl(student)
                ) {
                  this.classroomStore.remoteControlStore.authorizeStudentToControl(studentUuid);
                } else {
                  this.shareUIStore.addToast(
                    transI18n('fcr_share_device_not_support', { reason: student?.userName }),
                    'warning',
                  );
                }
              }

              break;
            case IPCMessageType.FetchStudentList:
              this.sendStudentListToRemoteControlBar();
              break;
            case IPCMessageType.StopScreenShareAndRemoteControl:
              this.classroomStore.remoteControlStore.unauthorizeStudentToControl();
              this.classroomStore.mediaStore.stopScreenShareCapture();
              break;
          }
        }),
      );
      this._disposers.push(
        reaction(
          () => this.classroomStore.remoteControlStore.remoteControlResponsing,
          (remoteControlResponsing) => {
            if (remoteControlResponsing) {
              this.shareUIStore.addDialog(DialogCategory.RemoteControlConfirm, {
                onOK: () => {
                  this.classroomStore.remoteControlStore.studentAcceptInvite();
                },
              });
            } else {
              const remoteControlConfirmDialog = this.shareUIStore.dialogQueue.find(
                (i) => i.category === DialogCategory.RemoteControlConfirm,
              );
              remoteControlConfirmDialog &&
                this.shareUIStore.removeDialog(remoteControlConfirmDialog.id);
            }
          },
        ),
      );
      this._disposers.push(
        reaction(
          () => this.classroomStore.userStore.studentList.size,
          this.sendStudentListToRemoteControlBar,
        ),
      );
    }
  }
}
