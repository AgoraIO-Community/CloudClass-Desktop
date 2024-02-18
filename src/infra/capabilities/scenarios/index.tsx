import { useStore } from '@classroom/infra/hooks/ui-store';
import { EduRoomTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { BigClassScenarioMobile } from './mobile/index.mobile';
// import '@classroom/ui-kit/styles/global.css';
import '@classroom/ui-kit/styles/scenario.css';
export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
};

export const Scenarios: React.FC<ScenariosProps> = observer(() => {
  const { initialize, destroy } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setInitialized(true);
    return () => {
      destroy();
    };
  }, []);

  if (!initialized) {
    return null;
  }

  return <BigClassScenarioMobile />;
});
