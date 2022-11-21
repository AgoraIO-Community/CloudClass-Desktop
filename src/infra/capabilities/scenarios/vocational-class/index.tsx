import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { HostingClassScenario } from './hosting-scene';
import { MixStreamCDNClassScenario } from './mix-stream-cdn-scene';
import { StandardClassScenario } from './standard-scene';

export const VocationalClassScenario = () => {
  switch (EduClassroomConfig.shared.sessionInfo.roomServiceType) {
    case EduRoomServiceTypeEnum.MixStreamCDN:
      if (EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.teacher) {
        return <MixStreamCDNClassScenario />;
      }
      return <StandardClassScenario />;
    case EduRoomServiceTypeEnum.HostingScene:
      return <HostingClassScenario />;
    default:
      return <StandardClassScenario />;
  }
};
