import { ToolbarUIStore } from 'agora-edu-core';

export class LectrueToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = ['screenShare', 'io.agora.countdown'];
}
