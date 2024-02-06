import { AgoraEduClassroomEvent, ClassroomState, EduEventCenter } from 'agora-edu-core';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';
import uuidv4 from 'uuid';
import { bound } from 'agora-rte-sdk';
import { CommonDialogType, DialogType } from '../../lecture-mobile/type';
import { MobileCallState } from '../../lecture-mobile/layout';

export class LayoutUIStore extends EduUIStoreBase {
  @observable
  awardAnims: { id: string }[] = [];

  @computed
  get isInSubRoom() {
    return this.getters.isInSubRoom;
  }

  @computed
  get loadingText() {
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

  @bound
  broadcastCallState(callState: MobileCallState) {
    this.extensionApi.updateMobileCallState(callState);
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
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }
  @observable dialogMap: Map<string, { type: DialogType }> = new Map();

  hasDialogOf(type: DialogType) {
    let exist = false;
    this.dialogMap.forEach(({ type: dialogType }) => {
      if (dialogType === type) {
        exist = true;
      }
    });

    return exist;
  }
  isDialogIdExist(id: string) {
    return this.dialogMap.has(id);
  }
  addDialog(type: 'confirm', params: CommonDialogType): void;

  @action.bound
  addDialog(type: unknown, params?: CommonDialogType<unknown>) {
    this.dialogMap.set(params?.id || uuidv4(), { ...(params as any), type: type as DialogType });
  }

  @action.bound
  deleteDialog = (id: string) => {
    this.dialogMap.delete(id);
  };
  onDestroy(): void {
    EduEventCenter.shared.offClassroomEvents(this._handleClassroomEvents);
  }
}
