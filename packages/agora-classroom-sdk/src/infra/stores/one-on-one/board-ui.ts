import { BoardUIStore } from '../common/board-ui';

export class OneToOneBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
    };
  }
}
