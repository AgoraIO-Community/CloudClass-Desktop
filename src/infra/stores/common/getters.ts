import { extractUserStreams } from '@classroom/infra/utils/extract';
import { EduStream, EduUserStruct, GroupState } from 'agora-edu-core';
import { ExpandedScopeState } from 'agora-edu-core';
import { AgoraRteVideoSourceType } from 'agora-rte-sdk';
import { isNumber } from 'lodash';
import { computed } from 'mobx';
import { EduClassroomUIStore } from '.';
import { LayoutMaskCode } from './type';

export class Getters {
  constructor(private _classroomUIStore: EduClassroomUIStore) {}

  /**
   * 讲台
   */
  @computed
  get layoutMaskCode() {
    const { flexProps } = this._classroomUIStore.classroomStore.roomStore;
    if (!isNumber(flexProps.area)) {
      // 未设置情况下开启讲台
      return LayoutMaskCode.None | LayoutMaskCode.StageVisible;
    }
    return flexProps.area;
  }

  /**
   * 讲台是否显示
   */
  @computed
  get stageVisible() {
    return !!(this.layoutMaskCode & LayoutMaskCode.StageVisible);
  }

  /**
   * 扩展屏是否已开启
   */
  @computed
  get videoGalleryStarted() {
    return (
      this._classroomUIStore.classroomStore.roomStore.expandedScope?.state ===
      ExpandedScopeState.open
    );
  }

  /**
   * 分组讨论是否已开启
   */
  @computed
  get breakoutRoomStarted() {
    return this._classroomUIStore.classroomStore.groupStore.state === GroupState.OPEN;
  }

  /**
   * 小窗用户ID
   */
  @computed
  get windowStreamUserUuids() {
    const { streamStore } = this._classroomUIStore.classroomStore;
    return Array.from(this._classroomUIStore.streamWindowUIStore.streamWindowMap.keys())
      .map((streamUuid) => streamStore.streamByStreamUuid.get(streamUuid)?.fromUser.userUuid)
      .filter((userUuid) => !!userUuid);
  }

  /**
   * 扩展屏流ID
   */
  @computed
  get galleryVideoStreamUuids() {
    if (this._classroomUIStore.videoGalleryUIStore.open) {
      return this._classroomUIStore.videoGalleryUIStore.curStreamList.map(
        (stream) => stream.stream.streamUuid,
      );
    }
    return [];
  }

  /**
   * 老师流信息
   * @returns
   */
  @computed
  get teacherCameraStream(): EduStream {
    const { classroomStore } = this._classroomUIStore;
    const { teacherList } = classroomStore.userStore;
    const { streamByStreamUuid, streamByUserUuid } = classroomStore.streamStore;

    const cameraStreams = extractUserStreams(teacherList, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams)[0];
  }

  /**
   * 学生流信息列表
   * @returns
   */
  @computed
  get studentCameraStreams(): EduStream[] {
    const { classroomStore } = this._classroomUIStore;
    const { studentList } = classroomStore.userStore;
    const { streamByStreamUuid, streamByUserUuid } = classroomStore.streamStore;

    const cameraStreams = extractUserStreams(studentList, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams);
  }

  /**
   * 台上人员列表
   */
  @computed
  get stageUsers(): EduUserStruct[] {
    const { userStore, roomStore } = this._classroomUIStore.classroomStore;
    return roomStore.acceptedList
      .map(({ userUuid }) => userStore.users.get(userUuid))
      .filter((user) => !!user) as EduUserStruct[];
  }

  /**
   * 台上人员流列表
   */
  @computed
  get stageCameraStreams(): EduStream[] {
    const { streamStore } = this._classroomUIStore.classroomStore;
    const { streamByStreamUuid, streamByUserUuid } = streamStore;

    const users = this.stageUsers.reduce((prev, user) => {
      prev.set(user.userUuid, user);
      return prev;
    }, new Map<string, EduUserStruct>());

    const cameraStreams = extractUserStreams(users, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams);
  }

  /**
   * 是否在分组房间
   */
  @computed
  get isInSubRoom() {
    return !!this._classroomUIStore.classroomStore.groupStore.currentSubRoom;
  }
}
