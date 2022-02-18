import { StreamUIStore } from 'agora-edu-core';
import { computed } from 'mobx';

export class OneToOneStreamUIStore extends StreamUIStore {
  //override
  @computed get toolbarPlacement(): 'bottom' | 'left' {
    return 'left';
  }

  onInstall(): void {
    super.onInstall();

    this.classroomStore.mediaStore.setMirror(true);
  }
}
