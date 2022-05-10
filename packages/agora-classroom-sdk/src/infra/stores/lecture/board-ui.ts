import { BoardUIStore } from '../common/board-ui';

export class LectureBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 0.706,
    };
  }
}
