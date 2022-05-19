import { computed } from 'mobx';
import { StreamUIStore } from '../common/stream';

export class OneToOneStreamUIStore extends StreamUIStore {
  //override
  @computed get toolbarPlacement(): 'bottom' | 'left' {
    return 'bottom';
  }

  onInstall(): void {
    super.onInstall();

    this.classroomStore.mediaStore.setMirror(true);
  }
}
