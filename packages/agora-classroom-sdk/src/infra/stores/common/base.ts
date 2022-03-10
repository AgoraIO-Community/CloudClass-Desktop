import { Injectable } from 'agora-rte-sdk';
import { EduClassroomStore } from 'agora-edu-core';
import { EduShareUIStore } from './share-ui';

export abstract class EduUIStoreBase {
  protected logger!: Injectable.Logger;
  /**
   * 参数覆盖
   */
  protected get uiOverrides() {
    return {};
  }
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
  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    this.classroomStore = store;
    this.shareUIStore = shareUIStore;
  }

  /**
   * 初始化
   */
  abstract onInstall(): void;

  /**
   * 销毁
   */
  abstract onDestroy(): void;
}
