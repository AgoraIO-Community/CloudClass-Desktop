import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduStreamTool,
  EduStreamToolCategory,
  EduStreamUI,
  StreamIconColor,
  StreamUIStore,
  transI18n,
} from 'agora-edu-core';
import { AGError, AgoraRteMediaPublishState } from 'agora-rte-sdk';
import { computed } from 'mobx';
import { computedFn } from 'mobx-utils';

export class InteractiveRoomStreamUIStore extends StreamUIStore {
  // 1 teacher + 6 students
  private _carouselShowCount = 7;

  private _gapInPx = 8;

  get videoStreamSize() {
    const width =
      this.shareUIStore.classroomViewportSize.width / this._carouselShowCount - this._gapInPx;

    const height = (9 / 16) * width;

    return { width, height };
  }

  @computed
  get carouselStreams(): EduStreamUI[] {
    const { acceptedList } = this.classroomStore.roomStore;

    const streams = [];

    for (let student of acceptedList) {
      let streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();

      for (let streamUuid of streamUuids) {
        let stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          let uiStream = new EduStreamUI(stream);

          streams.push(uiStream);
        }
      }
    }

    return streams;
  }

  @computed get localStreamTools(): EduStreamTool[] {
    const { sessionInfo } = EduClassroomConfig.shared;
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

    if (sessionInfo.role === EduRoleTypeEnum.teacher) {
      const { acceptedList } = this.classroomStore.roomStore;
      tools.push(
        new EduStreamTool(
          EduStreamToolCategory.podium_all,
          'invite-to-podium',
          transI18n('Clear Podiums'),
          {
            interactable: !!this.studentStreams.size,
            style: {
              color: acceptedList.length > 0 ? StreamIconColor.active : StreamIconColor.deactive,
            },
            onClick: async () => {
              try {
                await this.classroomStore.handUpStore.offPodiumAll();
              } catch (e) {
                this.shareUIStore.addGenericErrorDialog(e as AGError);
              }
            },
          },
        ),
      );
    }

    return tools;
  }

  remoteStreamTools = computedFn((stream: EduStreamUI): EduStreamTool[] => {
    const { sessionInfo } = EduClassroomConfig.shared;
    const iAmHost =
      sessionInfo.role === EduRoleTypeEnum.teacher ||
      sessionInfo.role === EduRoleTypeEnum.assistant;
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
            EduStreamToolCategory.podium,
            'invite-to-podium',
            transI18n('Clear Podium'),
            {
              interactable: true,
              style: {
                color: StreamIconColor.active,
              },
              onClick: async () => {
                try {
                  await this.classroomStore.handUpStore.offPodium(stream.fromUser.userUuid);
                } catch (e) {
                  this.shareUIStore.addGenericErrorDialog(e as AGError);
                }
              },
            },
          ),
          new EduStreamTool(
            EduStreamToolCategory.whiteboard,
            whiteboardAuthorized ? 'authorized' : 'no-authorized',
            whiteboardAuthorized ? transI18n('Close Whiteboard') : transI18n('Open Whiteboard'),
            {
              interactable: true,
              style: {
                color: whiteboardAuthorized ? StreamIconColor.active : StreamIconColor.deactive,
              },
              onClick: () => {
                try {
                  whiteboardAuthorized
                    ? this.classroomStore.boardStore.revokePermission(stream.fromUser.userUuid)
                    : this.classroomStore.boardStore.grantPermission(stream.fromUser.userUuid);
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

      if (stream.role === EduRoleTypeEnum.teacher) {
        const { acceptedList } = this.classroomStore.roomStore;
        tools.push(
          new EduStreamTool(
            EduStreamToolCategory.podium_all,
            'invite-to-podium',
            transI18n('Clear Podiums'),
            {
              interactable: !!this.studentStreams.size,
              style: {
                color: acceptedList.length > 0 ? StreamIconColor.active : StreamIconColor.deactive,
              },
              onClick: async () => {
                try {
                  await this.classroomStore.handUpStore.offPodiumAll();
                } catch (e) {
                  this.shareUIStore.addGenericErrorDialog(e as AGError);
                }
              },
            },
          ),
        );
      }
    }

    return tools;
  });

  get gap() {
    return this._gapInPx;
  }
}
