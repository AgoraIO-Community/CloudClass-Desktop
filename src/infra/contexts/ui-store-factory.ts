import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../stores/common';

export class EduUIStoreFactory {
  static create(store: EduClassroomStore) {
    return new EduClassroomUIStore(store);
  }
}
