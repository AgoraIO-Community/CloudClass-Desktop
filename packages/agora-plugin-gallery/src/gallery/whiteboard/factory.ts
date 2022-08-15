import { AgoraEduSDK } from '@/infra/api';
import { isProduction } from '@/infra/utils/env';
import { FcrBoardRoom } from './wrapper/board-room';
import { FcrBoardRegion } from './wrapper/type';

export class FcrBoardFactory {
  static createBoardRoom({ appId, region }: { appId: string; region: FcrBoardRegion }) {
    return new FcrBoardRoom(appId, region, {
      // debug: !isProduction,
      debug: false,
      ...AgoraEduSDK.boardWindowAnimationOptions,
    });
  }
}
