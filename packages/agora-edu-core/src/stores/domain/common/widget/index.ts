import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { IAgoraWidget } from './type';

/**
 * 负责功能：
 *  1.初始化Widgets
 *  2.注入依赖
 *  3.销毁Widgets
 *  4.Widgets实例
 */
export class WidgetStore extends EduStoreBase {
  widgets: { [key: string]: IAgoraWidget } = {};

  leave() {
    let keys = Object.keys(this.widgets);
    for (let i = 0; i < keys.length; i++) {
      try {
        this.widgets[keys[i]].widgetWillUnload();
      } catch (err: any) {
        EduErrorCenter.shared.handleThrowableError(AGEduErrorCode.EDU_ERR_WIDGET_LEAVE_FAIL, err);
      }
    }
  }
  onInstall() {}
  onDestroy() {}
}
