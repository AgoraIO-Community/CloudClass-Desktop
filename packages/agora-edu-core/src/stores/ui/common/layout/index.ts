import { computed, observable, runInAction, action } from 'mobx';
import uuidv4 from 'uuid';
import { EduUIStoreBase } from '../base';
import { AgoraEduClassroomEvent, ClassroomState } from '../../../../type';
import { EduEventCenter } from '../../../..';

export class LayoutUIStore extends EduUIStoreBase {
  @observable
  awardAnims: { id: string }[] = [];

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
    let classroomState = this.classroomStore.connectionStore.classroomState;
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }

  onDestroy(): void {}
}
