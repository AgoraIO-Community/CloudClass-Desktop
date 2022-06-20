import { EduClassroomConfig } from 'agora-edu-core';
import { reaction } from 'mobx';
import { BoardUIStore } from '../common/board-ui';

export class LectureBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 0.706,
    };
  }
  onInstall(): void {
    super.onInstall();
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.acceptedList,
        (acceptedList) => {
          const { userUuid } = EduClassroomConfig.shared.sessionInfo;
          const isOnPodium = acceptedList.some((item) => item.userUuid === userUuid);
          const isGranted = this.classroomStore.boardStore.grantUsers.has(userUuid);

          if (!isOnPodium && isGranted) {
            this.classroomStore.boardStore.revokePermission(userUuid);
          }
        },
      ),
    );
  }
}
