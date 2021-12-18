import { Injectable } from 'agora-rte-sdk';
import { EduClassroomStore } from '../../domain';
import { EduShareUIStore } from './share-ui';

export abstract class EduUIStoreBase {
  protected logger!: Injectable.Logger;
  protected uiOverrides: Object = {};
  readonly classroomStore: EduClassroomStore;
  readonly shareUIStore: EduShareUIStore;

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    this.classroomStore = store;
    this.shareUIStore = shareUIStore;
  }

  abstract onInstall(): void;
  abstract onDestroy(): void;
}
