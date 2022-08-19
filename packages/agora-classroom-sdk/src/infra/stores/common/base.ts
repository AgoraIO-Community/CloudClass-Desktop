import { Injectable } from 'agora-rte-sdk';
import { EduClassroomStore } from 'agora-edu-core';
import { EduShareUIStore } from './share-ui';
import { Board } from '@/infra/protocol/board';
import { Extension } from '@/infra/protocol';
import { Getters } from './getters';

export abstract class EduUIStoreBase {
  private static _boardApi = new Board();
  private static _extensionApi = new Extension();
  protected logger!: Injectable.Logger;
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
  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    this.classroomStore = store;
    this.shareUIStore = shareUIStore;
    this.getters = new Getters(this.classroomStore);
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
