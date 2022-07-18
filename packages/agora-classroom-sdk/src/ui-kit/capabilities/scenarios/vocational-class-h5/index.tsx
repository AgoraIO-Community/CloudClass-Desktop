import { EduClassroomConfig, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { HostingClassScenario } from './hosting-scene';
import './index.css';
import { MixStreamCDNClassScenario } from './mix-stream-cdn-scene';
import { StandardClassScenario } from './standard-scene';

export const VocationalClassScenarioH5 = () => {
  switch (EduClassroomConfig.shared.sessionInfo.roomServiceType) {
    case EduRoomServiceTypeEnum.MixStreamCDN:
      return <MixStreamCDNClassScenario />;
    case EduRoomServiceTypeEnum.HostingScene:
      return <HostingClassScenario />;
    default:
      return <StandardClassScenario />;
  }
};
