import { ClassroomState } from 'agora-edu-core';
import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';

export class LayoutUIStore extends EduUIStoreBase {
  onInstall(): void {}
  onDestroy(): void {}

  /**
   * 教室加载状态
   */
  @computed get loading(): boolean {
    const classroomState = this.classroomStore.connectionStore.classroomState;
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }
}
