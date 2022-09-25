import { useStore } from '@/infra/hooks/ui-store';
import {
  EduClassroomConfig,
  EduRoomServiceTypeEnum,
  EduRoomTypeEnum,
  Platform,
} from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useLayoutEffect, useState } from 'react';
import { RoomPretestContainer } from '~containers/pretest';
import { RoomPretestContainer as RoomPretestContainerV2 } from '~containers-v2/pretest';
import { OneToOneScenario } from './1v1';
import { BigClassScenario } from './big-class';
import { BigClassScenarioH5 } from './big-class-h5';
import { MidClassScenario } from './mid-class';
import { StudyRoomScenario } from './study-room';
import { VocationalClassScenario } from './vocational-class';
import { VocationalClassScenarioH5 } from './vocational-class-h5';

export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
  roomServiceType: EduRoomServiceTypeEnum;
};

const VocationalClass = () => {
  if (EduClassroomConfig.shared.platform === Platform.H5) {
    // 这里返回职业教育 移动端的组件
    return <VocationalClassScenarioH5 />;
  }
  // 这里返回职业教育 desktop 端的组件
  return <VocationalClassScenario />;
};

export const renderRoomSceneWith = (
  roomType: EduRoomTypeEnum,
  roomServiceType: EduRoomServiceTypeEnum,
) => {
  if (roomType === EduRoomTypeEnum.RoomBigClass && roomServiceType !== 0) {
    return <VocationalClass />;
  }
  switch (roomType) {
    case EduRoomTypeEnum.Room1v1Class: {
      return <OneToOneScenario />;
    }
    case EduRoomTypeEnum.RoomBigClass: {
      return EduClassroomConfig.shared.platform === Platform.H5 ? (
        <BigClassScenarioH5 />
      ) : (
        <BigClassScenario />
      );
    }
    case EduRoomTypeEnum.RoomSmallClass: {
      return <MidClassScenario />;
    }
    case EduRoomTypeEnum.RoomStudy: {
      return <StudyRoomScenario />;
    }
    default:
      return null;
  }
};

export const Scenarios: React.FC<ScenariosProps> = observer(
  ({ pretest, roomType, roomServiceType }) => {
    const { initialize } = useStore();
    const [initialized, setInitialized] = useState(false);

    useLayoutEffect(() => {
      initialize();
      setInitialized(true);
    }, [initialize]);

    const [showPretest, setPretest] = useState(pretest);
    const showPretestV2 = showPretest && roomType === EduRoomTypeEnum.RoomStudy;

    return initialized ? (
      showPretestV2 ? <RoomPretestContainerV2 onOK={() => setPretest(false)} /> :
        showPretest ? (
          <RoomPretestContainer onOK={() => setPretest(false)} />
        ) : (
          renderRoomSceneWith(roomType, roomServiceType)
        )
    ) : null;
  },
);
