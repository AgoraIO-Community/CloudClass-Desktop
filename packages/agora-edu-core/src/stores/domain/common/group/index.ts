import { action, observable, toJS } from 'mobx';
import { EduStoreBase } from '../base';

/**
 * 负责功能：
 *  1.获取子房间
 *  2.获取子房间对象
 *  3.加入子房间
 *  4.离开子房间
 *  5.主房间属性
 *  6.新增房间
 *  7.删除房间
 *  8.删除所有子房间
 *  9.添加用户到房间
 *  10.邀请用户到房间
 *  11.用户接收邀请进入房间
 *  12.用户移动至指定房间
 */
export class GroupStore extends EduStoreBase {
  /** Observables */

  /** Computeds */

  /** Methods */

  /** Hooks */
  onInstall() {}
  onDestroy() {}
}
