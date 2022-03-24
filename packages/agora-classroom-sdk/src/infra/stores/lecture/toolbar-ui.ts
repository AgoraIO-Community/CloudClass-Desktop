import { ToolbarUIStore } from '../common/toolbar-ui';

export class LectrueToolbarUIStore extends ToolbarUIStore {
  // @ts-ignore
  readonly allowedCabinetItems: string[] = window.agoraBridge ? ['laser', 'countdownTimer', 'poll'] : ['laser', 'screenShare', 'countdownTimer', 'poll'];
}
