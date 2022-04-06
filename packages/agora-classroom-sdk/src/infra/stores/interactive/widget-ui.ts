import { WidgetUIStore } from '../common/widget-ui';

export class InteractiveWidgetUIStore extends WidgetUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.819,
      aspectRatio: 0.461,
    };
  }
}
