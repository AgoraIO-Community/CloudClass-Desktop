import { BoardUIStore } from '../common/board-ui';

export class LectureBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.78,
      aspectRatio: 0.558,
    };
  }
}
