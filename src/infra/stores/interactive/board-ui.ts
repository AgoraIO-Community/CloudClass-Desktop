import { BoardUIStore } from '../common/board-ui';

export class InteractiveBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.84,
    };
  }
}
