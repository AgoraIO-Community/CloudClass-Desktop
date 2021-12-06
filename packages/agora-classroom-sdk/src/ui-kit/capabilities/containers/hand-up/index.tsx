import { EduRoleTypeEnum, EduClassroomConfig } from 'agora-edu-core';
import { useStore } from '~hooks/use-edu-stores';
import { observer } from 'mobx-react';
import { WaveArmSender } from './sender';
import { WaveArmManager, StudentsWaveArmList } from './manager';
import './index.css';

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

export const WaveArmSenderContainer = observer(() => {
  const { handUpUIStore } = useStore();
  const { waveArm, teacherUuid } = handUpUIStore;
  const waveArmDuration = async (duration: 3 | -1) => {
    await waveArm(teacherUuid, duration);
  };
  return <WaveArmSender waveArmDuration={waveArmDuration} />;
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
