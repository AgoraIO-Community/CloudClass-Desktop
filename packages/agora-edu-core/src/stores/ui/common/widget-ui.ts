import { computed } from 'mobx';
import { EduUIStoreBase } from './base';

export interface EduNavAction {
  title: string;
  iconType: string;
  iconColor?: string;
  onClick: () => void;
}

export enum TimeFormatType {
  Timeboard,
  Message,
}

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
