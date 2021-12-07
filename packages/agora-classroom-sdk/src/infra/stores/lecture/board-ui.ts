import { BoardUIStore } from 'agora-edu-core';

export class LectureBoardUIStore extends BoardUIStore {
  // override
  // ratio of board height in classroom viewport
  heightRatio = 0.78;
  // aspect ratio of board, height / width
  aspectRatio = 0.558;
}
