import { StreamUIStore } from '../common/stream';

export class OneToOneStreamUIStore extends StreamUIStore {
  private _teacherWidthRatio = 0.217;

  get toolbarPlacement(): 'bottom' | 'left' {
    return 'left';
  }

  get toolbarOffset(): number[] {
    return [10, 0];
  }

  get fullScreenToolbarOffset(): number[] {
    return [0, -58];
  }

  get videoStreamSize() {
    const width = this.shareUIStore.classroomViewportSize.width * this._teacherWidthRatio;

    const height = (9 / 16) * width;

    return { width, height };
  }

  onInstall(): void {
    super.onInstall();

    this.classroomStore.mediaStore.setMirror(true);
  }
}
