import { EduRoleTypeEnum, EduClassroomConfig } from 'agora-edu-core';
import { useStore } from '~hooks/use-edu-stores';
import { observer } from 'mobx-react';
import { WaveArmSender as WaveArmSenderContainer } from './sender';
import { WaveArmManager, StudentsWaveArmList } from './manager';
import './index.css';

export const WaveArmManagerContainer = observer(() => {
  const { handUpUIStore } = useStore();
  const { waveArmCount, hasWaveArmUser, isVocational } = handUpUIStore;
  return (
    <WaveArmManager hasWaveArmUser={hasWaveArmUser} waveArmCount={waveArmCount}>
      {isVocational ? null : <WaveArmListContainer />}
    </WaveArmManager>
  );
});

export const WaveArmListContainer = observer(() => {
  const { handUpUIStore } = useStore();
  const { onPodium } = handUpUIStore;
  const { userWaveArmList } = handUpUIStore;
  return <StudentsWaveArmList userWaveArmList={userWaveArmList} onClick={onPodium} />;
});

export const HandsUpContainer = observer(() => {
  const userRole = EduClassroomConfig.shared.sessionInfo.role;
  if (userRole === EduRoleTypeEnum.teacher) {
    return <WaveArmManagerContainer />;
  }
  if (userRole === EduRoleTypeEnum.student) {
    return <WaveArmSenderContainer />;
  }
  return null;
});
