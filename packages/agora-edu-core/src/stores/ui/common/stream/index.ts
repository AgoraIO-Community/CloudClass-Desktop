import {
  AGError,
  AGLocalTrackState,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
  AGRenderMode,
  AGRtcConnectionType,
  bound,
  RtcState,
} from 'agora-rte-sdk';
import {
  action,
  autorun,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { computedFn } from 'mobx-utils';
import { EduRoomTypeEnum, EduStream } from '../../../..';
import { EduClassroomConfig } from '../../../../configs';
import { ClassroomState, EduRoleTypeEnum } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduUIStoreBase } from '../base';
import { transI18n } from '../i18n';
import { CameraPlaceholderType } from '../type';
import { EduStreamUI } from './struct';
import { EduStreamTool, EduStreamToolCategory } from './tool';
import { v4 as uuidv4 } from 'uuid';

export enum StreamIconColor {
  active = '#357bf6',
  deactive = '#bdbdca',
  activeWarn = '#f04c36',
}

export class StreamUIStore extends EduUIStoreBase {
  private _autorunDisposer?: IReactionDisposer;

  onInstall() {
    reaction(
      () => this.classroomStore.mediaStore.localScreenShareTrackState,
      (state: AGLocalTrackState) => {
        // auto publish/unpublish when screenshare track started/stopped
        if (
          state === AGLocalTrackState.started &&
          this.classroomStore.roomStore.screenShareStreamUuid === undefined
        ) {
          this.publishScreenShare();
        } else if (
          state === AGLocalTrackState.stopped &&
          this.classroomStore.roomStore.screenShareStreamUuid !== undefined
        ) {
          this.unpublishScreenShare();
        }
      },
      {
        equals: (oldValue: AGLocalTrackState, newValue: AGLocalTrackState) => {
          return oldValue === newValue;
        },
      },
    );
    computed(() => this.classroomStore.userStore.rewards).observe(({ newValue, oldValue }) => {
      let anims: { id: string; userUuid: string }[] = [];
      Object.keys(newValue).forEach((userUuid) => {
        let previousReward = 0;
        if (oldValue) {
          previousReward = oldValue.get(userUuid) || 0;
        }
        let reward = newValue.get(userUuid) || 0;
        if (reward > previousReward) {
          anims.push({ id: uuidv4(), userUuid: userUuid });
        }
      });
      if (anims.length > 0) {
        runInAction(() => {
          this.awardAnims = this.awardAnims.concat(anims);
        });
      }
    });
    this._autorunDisposer = autorun(() => {
      let streamUuid = this.classroomStore.roomStore.screenShareStreamUuid || '';
      let token = this.classroomStore.streamStore.shareStreamTokens.get(streamUuid);
      if (
        token &&
        streamUuid &&
        this.classroomStore.mediaStore.localScreenShareTrackState === AGLocalTrackState.started
      ) {
        if (this.classroomStore.connectionStore.rtcSubState === RtcState.Idle) {
          this.classroomStore.connectionStore.joinRTC({
            connectionType: AGRtcConnectionType.sub,
            streamUuid,
            token,
          });
        }
      } else if (this.classroomStore.streamStore.shareStreamTokens.size === 0) {
        if (this.classroomStore.connectionStore.rtcSubState !== RtcState.Idle) {
          this.classroomStore.connectionStore.leaveRTC(AGRtcConnectionType.sub);
        }
      }
    });
  }

  //observe
  @observable awardAnims: { id: string; userUuid: string }[] = [];
  //action
  //computes
  @computed get teacherStreams(): Set<EduStreamUI> {
    let streamSet = new Set<EduStreamUI>();
    let teacherList = this.classroomStore.userStore.teacherList;
    for (let teacher of teacherList.values()) {
      let streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(teacher.userUuid) || new Set();
      for (let streamUuid of streamUuids) {
        let stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          let uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  //only call this api if you are confident there will always be 1 teacher stream only
  @computed get teacherCameraStream(): EduStreamUI | undefined {
    let streamSet = new Set<EduStreamUI>();
    let streams = this.teacherStreams;
    for (let stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_TEACHER_STREAM_LENGTH,
        new Error(`unexpected stream size ${streams.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }

  @computed get teacherScreenShareStream() {
    let streamUuid = this.classroomStore.roomStore.screenShareStreamUuid;

    if (!streamUuid) {
      return undefined;
    }

    let streamSet = new Set<EduStreamUI>();
    let streams = this.teacherStreams;
    for (let stream of streams) {
      if (
        stream.stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare &&
        stream.stream.streamUuid === streamUuid
      ) {
        streamSet.add(stream);
      }
    }

    // if (streamSet.size > 1) {
    //   return EduErrorCenter.shared.handleThrowableError(
    //     AGEduErrorCode.EDU_ERR_UNEXPECTED_TEACHER_STREAM_LENGTH,
    //     new Error(`unexpected stream size ${streams.size}`),
    //   );
    // }
    return Array.from(streamSet)[0];
  }

  @computed get studentCameraStream(): EduStreamUI | undefined {
    let streamSet = new Set<EduStreamUI>();
    let streams = this.studentStreams;
    for (let stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streams.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_STUDENT_STREAM_LENGTH,
        new Error(`unexpected stream size ${streams.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }

  @computed get studentStreams(): Set<EduStreamUI> {
    let streamSet = new Set<EduStreamUI>();
    let studentList = this.classroomStore.userStore.studentList;
    for (let student of studentList.values()) {
      let streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();
      for (let streamUuid of streamUuids) {
        let stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          let uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  @computed get streamVolumes(): Map<string, number> {
    return this.classroomStore.streamStore.streamVolumes;
  }

  @computed get localVolume(): number {
    return this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  @computed get localCameraTrackState(): AGLocalTrackState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  @computed get localMicTrackState(): AGLocalTrackState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  @computed get localScreenShareOff() {
    return this.classroomStore.mediaStore.localScreenShareTrackState !== AGLocalTrackState.started;
  }

  @computed get localCameraOff() {
    return this.localCameraTrackState !== AGLocalTrackState.started;
  }

  @computed get localMicOff() {
    return this.localMicTrackState !== AGLocalTrackState.started;
  }

  @computed get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }

  @computed get whiteboardGrantUsers() {
    return this.classroomStore.boardStore.grantUsers;
  }

  awards = computedFn((stream: EduStreamUI): number => {
    let reward = this.classroomStore.userStore.rewards.get(stream.fromUser.userUuid);
    return reward || 0;
  });

  streamAwardAnims = computedFn((stream: EduStreamUI): { id: string; userUuid: string }[] => {
    return this.awardAnims.filter((anim) => anim.userUuid === stream.fromUser.userUuid);
  });

  @computed get localStreamTools(): EduStreamTool[] {
    let tools: EduStreamTool[] = [];
    tools = tools.concat([
      new EduStreamTool(
        EduStreamToolCategory.camera,
        this.localCameraOff ? 'camera' : 'camera-off',
        this.localCameraOff ? transI18n('Open Camera') : transI18n('Close Camera'),
        {
          //i can always control myself
          interactable: true,
          style: {
            color: this.localCameraOff ? StreamIconColor.active : StreamIconColor.activeWarn,
          },
          onClick: async () => {
            try {
              const targetState = this.localCameraOff
                ? AgoraRteMediaPublishState.Published
                : AgoraRteMediaPublishState.Unpublished;
              this.toggleLocalVideo();
              await this.classroomStore.streamStore.updateLocalPublishState({
                videoState: targetState,
              });
            } catch (e) {
              this.shareUIStore.addGenericErrorDialog(e as AGError);
            }
          },
        },
      ),
      new EduStreamTool(
        EduStreamToolCategory.microphone,
        this.localMicOff ? 'microphone-on-outline' : 'microphone-off-outline',
        this.localMicOff ? transI18n('Open Microphone') : transI18n('Close Microphone'),
        {
          //host can control, or i can control myself
          interactable: true,
          style: {
            color: this.localMicOff ? StreamIconColor.active : StreamIconColor.activeWarn,
          },
          onClick: async () => {
            try {
              const targetState = this.localMicOff
                ? AgoraRteMediaPublishState.Published
                : AgoraRteMediaPublishState.Unpublished;
              this.toggleLocalAudio();
              await this.classroomStore.streamStore.updateLocalPublishState({
                audioState: targetState,
              });
            } catch (e) {
              this.shareUIStore.addGenericErrorDialog(e as AGError);
            }
          },
        },
      ),
    ]);

    return tools;
  }

  remoteStreamTools = computedFn((stream: EduStreamUI): EduStreamTool[] => {
    const iAmHost =
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant;
    let tools: EduStreamTool[] = [];
    let videoMuted = stream.stream.videoState === AgoraRteMediaPublishState.Unpublished;
    let audioMuted = stream.stream.audioState === AgoraRteMediaPublishState.Unpublished;
    if (iAmHost) {
      tools = tools.concat([
        new EduStreamTool(
          EduStreamToolCategory.camera,
          videoMuted ? 'camera' : 'camera-off',
          videoMuted ? transI18n('Open Camera') : transI18n('Close Camera'),
          {
            //host can control
            interactable: iAmHost,
            style: {
              color: videoMuted ? StreamIconColor.active : StreamIconColor.activeWarn,
            },
            onClick: () => {
              this.classroomStore.streamStore
                .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
                  videoState: videoMuted
                    ? AgoraRteMediaPublishState.Published
                    : AgoraRteMediaPublishState.Unpublished,
                })
                .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
            },
          },
        ),
        new EduStreamTool(
          EduStreamToolCategory.microphone,
          audioMuted ? 'microphone-on-outline' : 'microphone-off-outline',
          audioMuted ? transI18n('Open Microphone') : transI18n('Close Microphone'),
          {
            //host can control, or i can control myself
            interactable: iAmHost,
            style: {
              color: audioMuted ? StreamIconColor.active : StreamIconColor.activeWarn,
            },
            onClick: async () => {
              this.classroomStore.streamStore
                .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
                  audioState: audioMuted
                    ? AgoraRteMediaPublishState.Published
                    : AgoraRteMediaPublishState.Unpublished,
                })
                .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
            },
          },
        ),
      ]);
      if (stream.role === EduRoleTypeEnum.student) {
        const whiteboardAuthorized = this.whiteboardGrantUsers.has(stream.fromUser.userUuid);
        tools = tools.concat([
          new EduStreamTool(
            EduStreamToolCategory.whiteboard,
            whiteboardAuthorized ? 'authorized' : 'no-authorized',
            whiteboardAuthorized ? transI18n('Close Whiteboard') : transI18n('Open Whiteboard'),
            {
              interactable: true,
              style: {
                color: whiteboardAuthorized ? StreamIconColor.active : StreamIconColor.deactive,
              },
              onClick: async () => {
                try {
                  whiteboardAuthorized
                    ? await this.classroomStore.boardStore.revokePermission(
                        stream.fromUser.userUuid,
                      )
                    : await this.classroomStore.boardStore.grantPermission(
                        stream.fromUser.userUuid,
                      );
                } catch (e) {
                  this.shareUIStore.addGenericErrorDialog(e as AGError);
                }
              },
            },
          ),
          new EduStreamTool(EduStreamToolCategory.star, 'star-outline', transI18n('Star'), {
            interactable: true,
            style: {
              color: StreamIconColor.active,
            },
            onClick: () => {
              this.classroomStore.roomStore
                .sendRewards(EduClassroomConfig.shared.sessionInfo.roomUuid, [
                  { userUuid: stream.fromUser.userUuid, changeReward: 1 },
                ])
                .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
            },
          }),
        ]);
      }
    }
    return tools;
  });

  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  notPresentText(role: EduRoleTypeEnum): string {
    return role === EduRoleTypeEnum.teacher
      ? transI18n('stream.placeholder.notpresent.teacher')
      : transI18n('stream.placeholder.notpresent.student');
  }

  getCameraPlaceholderText(type: CameraPlaceholderType): string {
    switch (type) {
      case CameraPlaceholderType.loading:
      case CameraPlaceholderType.none:
        return transI18n('stream.placeholder.loading');
      case CameraPlaceholderType.muted:
        return transI18n('stream.placeholder.muted');
      case CameraPlaceholderType.broken:
        return transI18n('stream.placeholder.broken');
    }
    return '';
  }

  cameraPlaceholderText = computedFn((stream: EduStreamUI): string => {
    return this.getCameraPlaceholderText(this.cameraPlaceholder(stream));
  });

  cameraPlaceholder = computedFn((stream: EduStreamUI): CameraPlaceholderType => {
    let placeholder = CameraPlaceholderType.none;
    if (!stream.stream.isLocal) {
      if (stream.stream.videoState === AgoraRteMediaPublishState.Published) {
        placeholder = CameraPlaceholderType.none;
      } else {
        placeholder = CameraPlaceholderType.muted;
      }
      return placeholder;
    } else {
      let placeholder = CameraPlaceholderType.none;
      switch (this.localCameraTrackState) {
        case AGLocalTrackState.started:
          placeholder = CameraPlaceholderType.none;
          break;
        case AGLocalTrackState.starting:
          placeholder = CameraPlaceholderType.loading;
          break;
        case AGLocalTrackState.stopped:
          placeholder = CameraPlaceholderType.muted;
          break;
        case AGLocalTrackState.error:
          placeholder = CameraPlaceholderType.broken;
          break;
      }
      return placeholder;
    }
  });

  @computed get toolbarPlacement(): 'left' | 'bottom' {
    return 'bottom';
  }

  @action.bound removeAward(id: string) {
    this.awardAnims = this.awardAnims.filter((anim) => anim.id !== id);
  }

  @bound
  toggleLocalVideo() {
    if (this.localCameraOff) {
      this.classroomStore.mediaStore.enableLocalVideo(true);
    } else {
      this.classroomStore.mediaStore.enableLocalVideo(false);
    }
  }

  @bound
  toggleLocalAudio() {
    if (this.localMicOff) {
      this.classroomStore.mediaStore.enableLocalAudio(true);
    } else {
      this.classroomStore.mediaStore.enableLocalAudio(false);
    }
  }

  @bound
  setupLocalVideo(stream: EduStream, dom: HTMLElement, mirror?: boolean) {
    return this.classroomStore.streamStore.setupLocalVideo(stream, dom, mirror);
  }

  @bound
  setupRemoteVideo(stream: EduStream, dom: HTMLElement, renderMode?: AGRenderMode) {
    return this.classroomStore.streamStore.setupRemoteVideo(stream, dom, renderMode);
  }
  //others
  @bound
  setupLocalScreenShare(dom: HTMLElement) {
    this.classroomStore.mediaStore.setupLocalScreenShare(dom);
  }

  @bound
  stopScreenShareCapture() {
    return this.classroomStore.mediaStore.stopScreenShareCapture();
  }

  @bound
  publishScreenShare() {
    this.classroomStore.streamStore
      .publishScreenShare()
      .then(({ rtcToken, streamUuid }: { rtcToken: string; streamUuid: string }) => {
        runInAction(() => {
          this.classroomStore.streamStore.shareStreamTokens.set(streamUuid, rtcToken);
        });
      })
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
  }

  @bound
  unpublishScreenShare() {
    this.classroomStore.streamStore
      .unpublishScreenShare()
      .then(() => {
        runInAction(() => {
          this.classroomStore.streamStore.shareStreamTokens.clear();
        });
      })
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
  }

  onDestroy() {
    this._autorunDisposer && this._autorunDisposer();
  }
}
