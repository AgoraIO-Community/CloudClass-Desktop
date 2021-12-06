import { AGError, AgoraRteMediaPublishState } from 'agora-rte-sdk';
import { computed } from 'mobx';
import { computedFn } from 'mobx-utils';
import { EduClassroomConfig } from '../../../configs';
import { EduRoleTypeEnum } from '../../../type';
import { transI18n } from '../common/i18n';
import { StreamIconColor, StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';
import { EduStreamTool, EduStreamToolCategory } from '../common/stream/tool';

export class OneToOneStreamUIStore extends StreamUIStore {
  //override
  @computed get toolbarPlacement(): 'bottom' | 'left' {
    return 'left';
  }

  // remoteStreamTools = computedFn((stream: EduStreamUI): EduStreamTool[] => {
  //   const iAmHost = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  //   let tools: EduStreamTool[] = [];
  //   let videoMuted = stream.stream.videoState === AgoraRteMediaPublishState.Unpublished;
  //   let audioMuted = stream.stream.audioState === AgoraRteMediaPublishState.Unpublished;
  //   if (iAmHost) {
  //     tools = tools.concat([
  //       new EduStreamTool(
  //         EduStreamToolCategory.camera,
  //         videoMuted ? 'camera' : 'camera-off',
  //         videoMuted ? transI18n('Open Camera') : transI18n('Close Camera'),
  //         {
  //           //host can control
  //           interactable: iAmHost,
  //           style: {
  //             color: videoMuted ? StreamIconColor.active : StreamIconColor.activeWarn,
  //           },
  //           onClick: () => {
  //             this.classroomStore.streamStore
  //               .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
  //                 videoState: videoMuted
  //                   ? AgoraRteMediaPublishState.Published
  //                   : AgoraRteMediaPublishState.Unpublished,
  //               })
  //               .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
  //           },
  //         },
  //       ),
  //       new EduStreamTool(
  //         EduStreamToolCategory.microphone,
  //         audioMuted ? 'microphone-on-outline' : 'microphone-off-outline',
  //         audioMuted ? transI18n('Open Microphone') : transI18n('Close Microphone'),
  //         {
  //           //host can control, or i can control myself
  //           interactable: iAmHost,
  //           style: {
  //             color: audioMuted ? StreamIconColor.active : StreamIconColor.activeWarn,
  //           },
  //           onClick: async () => {
  //             this.classroomStore.streamStore
  //               .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
  //                 audioState: audioMuted
  //                   ? AgoraRteMediaPublishState.Published
  //                   : AgoraRteMediaPublishState.Unpublished,
  //               })
  //               .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
  //           },
  //         },
  //       ),
  //     ]);

  //     const whiteboardAuthorized = this.whiteboardGrantUsers.has(stream.fromUser.userUuid);
  //     tools = tools.concat([
  //       new EduStreamTool(
  //         EduStreamToolCategory.whiteboard,
  //         whiteboardAuthorized ? 'authorized' : 'no-authorized',
  //         whiteboardAuthorized ? transI18n('Close Whiteboard') : transI18n('Open Whiteboard'),
  //         {
  //           interactable: true,
  //           style: {
  //             color: whiteboardAuthorized ? StreamIconColor.active : StreamIconColor.deactive,
  //           },
  //           onClick: () => {
  //             try {
  //               whiteboardAuthorized
  //                 ? this.classroomStore.boardStore.revokePermission(stream.fromUser.userUuid)
  //                 : this.classroomStore.boardStore.grantPermission(stream.fromUser.userUuid);
  //             } catch (e) {
  //               this.shareUIStore.addGenericErrorDialog(e as AGError);
  //             }
  //           },
  //         },
  //       ),
  //     ]);
  //   }
  //   return tools;
  // });
}
