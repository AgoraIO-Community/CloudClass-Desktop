import { BoardUIStore } from 'agora-edu-core';

export class OneToOneBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 0.706,
    };
  }
}
