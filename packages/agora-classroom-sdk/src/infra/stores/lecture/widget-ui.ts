import { WidgetUIStore } from '../common/widget-ui';

export class LectureWidgetUIStore extends WidgetUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 0.706,
    };
  }
}
