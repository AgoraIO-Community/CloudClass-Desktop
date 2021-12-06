import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';
import { ClassroomState } from '../../../../type';

export class LayoutUIStore extends EduUIStoreBase {
  onInstall(): void {}
  onDestroy(): void {}

  @computed get loading(): boolean {
    let classroomState = this.classroomStore.connectionStore.classroomState;
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }
}
