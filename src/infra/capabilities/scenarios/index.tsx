import { useStore } from '@classroom/infra/hooks/ui-store';
import { EduClassroomConfig, EduRoomTypeEnum, Platform } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { RoomPretest } from '@classroom/infra/capabilities/containers/pretest';
import { useEffect, useState } from 'react';
import { OneToOneScenario } from './1v1';
import { BigClassScenario } from './big-class';
import { BigClassScenarioMobile } from './big-class-mobile/index.mobile';
import { MidClassScenario } from './mid-class';
import '@classroom/ui-kit/styles/global.css';
import '@classroom/ui-kit/styles/scenario.css';
export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
};

export const renderRoomSceneWith = (roomType: EduRoomTypeEnum) => {
  switch (roomType) {
    case EduRoomTypeEnum.Room1v1Class: {
      return <OneToOneScenario />;
    }
    case EduRoomTypeEnum.RoomBigClass: {
      return EduClassroomConfig.shared.platform === Platform.H5 ? (
        <BigClassScenarioMobile />
      ) : (
        <BigClassScenario />
      );
    }
    case EduRoomTypeEnum.RoomSmallClass: {
      return <MidClassScenario />;
    }
    default:
      return null;
  }
};

export const Scenarios: React.FC<ScenariosProps> = observer(({ pretest, roomType }) => {
  const { initialize, destroy } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setInitialized(true);
    return () => {
      destroy();
    };
  }, []);

  const [showPretest, setPretest] = useState(pretest);

  if (!initialized) {
    return null;
  }

  if (showPretest) {
    return (
      <div className="fcr-w-screen fcr-h-screen">
        <RoomPretest onOK={() => setPretest(false)} />;
      </div>
    );
  }

  return renderRoomSceneWith(roomType);
});
