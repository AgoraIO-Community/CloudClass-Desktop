import { useStore } from '@classroom/infra/hooks/ui-store';
import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { visibilityControl, raiseHandEnabled } from 'agora-common-libs';
import './index.css';
import { StudentsWaveArmList, WaveArmManager } from './manager';
import { WaveArmSender as WaveArmSenderContainer } from './sender';

export const WaveArmManagerContainer = observer(() => {
  const { handUpUIStore } = useStore();
  const { waveArmCount, hasWaveArmUser } = handUpUIStore;
  return (
    <WaveArmManager hasWaveArmUser={hasWaveArmUser} waveArmCount={waveArmCount}>
      <WaveArmListContainer />
    </WaveArmManager>
  );
});

export const WaveArmListContainer = observer(() => {
  const { handUpUIStore } = useStore();
  const { onPodium } = handUpUIStore;
  const { userWaveArmList } = handUpUIStore;

  return <StudentsWaveArmList userWaveArmList={userWaveArmList} onClick={onPodium} />;
});

export const HandsUpContainer = visibilityControl(
  observer(() => {
    const userRole = EduClassroomConfig.shared.sessionInfo.role;
    if (userRole === EduRoleTypeEnum.teacher) {
      return <WaveArmManagerContainer />;
    }
    if (userRole === EduRoleTypeEnum.student) {
      return <WaveArmSenderContainer />;
    }
    return null;
  }),
  raiseHandEnabled,
);
