import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';
import { ClassroomState } from '../../../../type';

export class LayoutUIStore extends EduUIStoreBase {
  onInstall(): void {}
  onDestroy(): void {}

  /**
   * 教室加载状态
   */
  @computed get loading(): boolean {
    let classroomState = this.classroomStore.connectionStore.classroomState;
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }
}
