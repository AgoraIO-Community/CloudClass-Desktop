import { Injectable } from 'agora-rte-sdk';
import { EduClassroomStore } from '.';
export abstract class EduStoreBase {
  protected logger!: Injectable.Logger;
  protected readonly classroomStore: EduClassroomStore;
  constructor(store: EduClassroomStore) {
    this.classroomStore = store;
  }

  protected get api() {
    return this.classroomStore.api;
  }

  abstract onInstall(): void;
  abstract onDestroy(): void;
}
