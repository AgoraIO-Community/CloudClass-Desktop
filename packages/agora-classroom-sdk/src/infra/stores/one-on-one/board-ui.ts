import { BoardUIStore } from 'agora-edu-core';

export class OneToOneBoardUIStore extends BoardUIStore {
  // override
  // ratio of board height in classroom viewport
  heightRatio = 1;
  // aspect ratio of board, height / width
  aspectRatio = 0.706;
}
