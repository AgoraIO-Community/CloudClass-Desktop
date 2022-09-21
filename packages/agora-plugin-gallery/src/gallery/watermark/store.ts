import { action, observable } from 'mobx';
import { FcrWatermarkWidget } from '.';

export class WidgetWatermarkUIStore {
  constructor(private _widget: FcrWatermarkWidget) {}

  @observable
  content: string = '';

  @observable
  visible: boolean = false;

  @action.bound
  setVisible(visible: boolean) {
    this.visible = visible;
  }

  @action.bound
  setContent(content: string) {
    this.content = content;
  }
}
