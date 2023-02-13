import { EduClassroomStore } from 'agora-edu-core';
import { EduShareUIStore } from './share';
import { Board } from '@classroom/infra/protocol/board';
import { Extension } from '@classroom/infra/protocol';
import { Getters } from './getters';
import { Logger } from 'agora-rte-sdk';

export abstract class EduUIStoreBase {
  private static _boardApi = new Board();
  private static _extensionApi = new Extension();
  protected readonly logger!: Logger;
  /**
   * 参数覆盖
   */
  protected get uiOverrides() {
    return {};
  }

  protected readonly getters: Getters;
  /**
   * 当前 EduClassroomStore 实例
   */
  readonly classroomStore: EduClassroomStore;
  /**
   * EduShareUIStore 实例
   */
  readonly shareUIStore: EduShareUIStore;

  /**
   * 构造函数
   * @param store
   * @param shareUIStore
   */
  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore, getters: Getters) {
    this.classroomStore = store;
    this.shareUIStore = shareUIStore;
    this.getters = getters;
  }

  /**
   * 初始化
   */
  abstract onInstall(): void;

  /**
   * 销毁
   */
  abstract onDestroy(): void;

  /**
   * 白板API服务
   */
  get boardApi() {
    return EduUIStoreBase._boardApi;
  }

  /**
   * 扩展API
   */
  get extensionApi() {
    return EduUIStoreBase._extensionApi;
  }
}
