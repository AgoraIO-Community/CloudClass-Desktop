import { useStore } from '@/infra/hooks/use-edu-stores';
import { DialogCategory } from '@/infra/stores/common/share-ui';
import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { useState, FC } from 'react';
import { Card, SvgImg } from '~ui-kit';

export const MidRosterBtn = () => <RosterBtn />;

export const BigRosterBtn = () => {
  const role = EduClassroomConfig.shared.sessionInfo.role;

  return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role) ? (
    <RosterBtn isLectureRoster={true} />
  ) : null;
};

const RosterBtn: FC<{ isLectureRoster?: boolean }> = ({ isLectureRoster = false }) => {
  const REGISTER_TYPE = 'register',
    SIZE = 40,
    ICON_SIZE = 28;
  const uiStore = useStore();
  const [isActive, setIsActive] = useState(false);
  const handleClick = () => {
    setIsActive(true);
    uiStore.shareUIStore.addDialog(
      isLectureRoster ? DialogCategory.LectureRoster : DialogCategory.Roster,
      {
        onClose: () => {
          setIsActive(false);
        },
      },
    );
  };

  return (
    <Card
      width={SIZE}
      height={SIZE}
      borderRadius={SIZE}
      className={isActive ? 'roster-btn-active' : 'roster-btn'}>
      <SvgImg
        type={REGISTER_TYPE}
        onClick={handleClick}
        size={ICON_SIZE}
        style={{ cursor: 'pointer' }}
      />
    </Card>
  );
};
