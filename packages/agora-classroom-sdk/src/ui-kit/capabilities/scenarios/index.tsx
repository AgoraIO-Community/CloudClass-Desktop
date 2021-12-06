import { EduRoomTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useLayoutEffect, useState } from 'react';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { RoomPretestContainer } from '~containers/pretest';
import { OneToOneScenario } from './1v1';
import { MidClassScenario } from './mid-class';
import { BigClassScenario } from './big-class';

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
      return <BigClassScenario />;
    }
    case EduRoomTypeEnum.RoomSmallClass: {
      return <MidClassScenario />;
    }
  }
};

export const Scenarios: React.FC<ScenariosProps> = observer(({ pretest, roomType }) => {
  const { initialize } = useStore();

  useLayoutEffect(() => {
    initialize();
  }, [initialize]);

  const [showPretest, setPretest] = useState(pretest);

  return showPretest ? (
    <RoomPretestContainer onOK={() => setPretest(false)} />
  ) : (
    renderRoomSceneWith(roomType)
  );
});
