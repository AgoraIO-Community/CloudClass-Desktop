import { AgoraEduClassroomEvent, ClassroomState, EduEventCenter } from 'agora-edu-core';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';
import uuidv4 from 'uuid';

export class LayoutUIStore extends EduUIStoreBase {
  @observable
  awardAnims: { id: string }[] = [];

  @computed
  get isInSubRoom() {
    return !!this.classroomStore.groupStore.currentSubRoom;
  }

  onInstall(): void {
    EduEventCenter.shared.onClassroomEvents((event) => {
      if (event === AgoraEduClassroomEvent.BatchRewardReceived) {
        runInAction(() => {
          this.awardAnims.push({
            id: uuidv4(),
          });
        });
      }
    });
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

  onDestroy(): void {}
}
