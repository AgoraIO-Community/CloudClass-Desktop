import { BoardUIStore } from 'agora-edu-core';

export class LectureBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.78,
      aspectRatio: 0.558,
    };
  }
}
