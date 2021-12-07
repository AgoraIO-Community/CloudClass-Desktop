import { BoardUIStore } from 'agora-edu-core';

export class InteractiveBoardUIStore extends BoardUIStore {
  // override
  // ratio of board height in classroom viewport
  heightRatio = 0.819;
  // aspect ratio of board, height / width
  aspectRatio = 0.461;
}
