import { computed } from 'mobx';
import { EduUIStoreBase } from './base';

export class WidgetUIStore extends EduUIStoreBase {
  onInstall() {
    computed(() => this.classroomStore.widgetStore.widgetStateMap).observe(
      ({ oldValue = {}, newValue }) => {
        Object.keys(newValue).forEach((widgetId) => {
          if (oldValue[widgetId] !== newValue[widgetId]) {
            if (newValue[widgetId]) {
              this.onWidgetActive(widgetId);
            } else {
              this.onWidgetInActive(widgetId);
            }
          }
        });
      },
    );
  }

  onWidgetActive(widgetId: string) {}

  onWidgetInActive(widgetId: string) {}

  onDestroy() {}
}
