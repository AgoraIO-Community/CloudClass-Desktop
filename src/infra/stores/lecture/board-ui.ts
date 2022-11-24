import { EduClassroomConfig } from 'agora-edu-core';
import { reaction } from 'mobx';
import { BoardUIStore } from '../common/board-ui';

export class LectureBoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
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
          const isGranted = this.boardApi.grantedUsers.has(userUuid);

          if (!isOnPodium && isGranted) {
            this.boardApi.grantPrivilege(userUuid, false);
          }
        },
      ),
    );
  }
}
