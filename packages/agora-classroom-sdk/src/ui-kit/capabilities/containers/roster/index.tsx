import React, { useCallback } from 'react';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { DialogCategory, EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { Card, SvgImg } from '~ui-kit';

export const MidRosterBtn = () => <RosterBtn />;

export const BigRosterBtn = () => {
  const role = EduClassroomConfig.shared.sessionInfo.role;

  return role === EduRoleTypeEnum.teacher ? <RosterBtn /> : null;
};

const RosterBtn = () => {
  const REGISTER_TYPE = 'register',
    SIZE = 40,
    ICON_SIZE = 28;
  const uiStore = useStore();
  const handleClick = () => {
    uiStore.shareUIStore.addDialog(DialogCategory.Roster);
  };

  return (
    <Card width={SIZE} height={SIZE} borderRadius={SIZE}>
      <SvgImg type={REGISTER_TYPE} canHover={true} onClick={handleClick} size={ICON_SIZE} />
    </Card>
  );
};
