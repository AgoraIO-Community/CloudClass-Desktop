import { AgoraEduClassroomEvent, ClassroomState, EduEventCenter } from 'agora-edu-core';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';
import uuidv4 from 'uuid';
import { transI18n } from '~ui-kit';
import { bound } from 'agora-rte-sdk';

export class LayoutUIStore extends EduUIStoreBase {
  @observable
  awardAnims: { id: string }[] = [];

  @computed
  get isInSubRoom() {
    return !!this.classroomStore.groupStore.currentSubRoom;
  }

  @computed
  get loadingText() {
    if (this.classroomStore.remoteControlStore.remoteControlRequesting) {
      const studentName = this.classroomStore.remoteControlStore.currentStudent?.userName;
      return transI18n('fcr_share_reminded_student_agree', {
        reason1: studentName,
        reason2: studentName,
      });
    }
    return '';
  }

  /**
   * 所在房间名称
   */
  @computed
  get currentSubRoomName() {
    let groupName = null;
    const { currentSubRoom, groupDetails } = this.classroomStore.groupStore;
    if (currentSubRoom) {
      const group = groupDetails.get(currentSubRoom);

      groupName = group?.groupName;
    }
    return groupName;
  }

  onInstall(): void {
    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvents);
  }

  @bound
  private _handleClassroomEvents(event: AgoraEduClassroomEvent) {
    if (event === AgoraEduClassroomEvent.BatchRewardReceived) {
      runInAction(() => {
        this.awardAnims.push({
          id: uuidv4(),
        });
      });
    }
  }

  @action.bound
  removeAward(id: string) {
    this.awardAnims = this.awardAnims.filter((anim) => anim.id !== id);
  }
  /**
   * 教室加载状态
   */
  @computed get loading(): boolean {
    const classroomState = this.classroomStore.connectionStore.classroomState;
    const remoteControlRequesting = this.classroomStore.remoteControlStore.remoteControlRequesting;
    return (
      classroomState === ClassroomState.Connecting ||
      classroomState === ClassroomState.Reconnecting ||
      remoteControlRequesting
    );
  }

  onDestroy(): void {
    EduEventCenter.shared.offClassroomEvents(this._handleClassroomEvents);
  }
}
