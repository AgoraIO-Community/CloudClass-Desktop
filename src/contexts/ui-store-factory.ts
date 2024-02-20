import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../uistores';

export class EduUIStoreFactory {
  static create(store: EduClassroomStore) {
    return new EduClassroomUIStore(store);
  }
}
