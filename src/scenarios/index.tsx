import { useStore } from '@classroom/hooks/ui-store';
import { EduRoomTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Scenario } from './scenario';
import '@classroom/ui-kit/styles/scenario.css';
import { DevicePretest } from '@classroom/containers/device-pretest';
export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
};

export const Scenarios: React.FC<ScenariosProps> = observer(() => {
  const { initialize, destroy, deviceSettingUIStore: { isDevicePretestFinished } } = useStore();
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

  return (
    <React.Fragment>
      {!isDevicePretestFinished && <DevicePretest />}
      {isDevicePretestFinished && <Scenario />}
    </React.Fragment>
  );
});
