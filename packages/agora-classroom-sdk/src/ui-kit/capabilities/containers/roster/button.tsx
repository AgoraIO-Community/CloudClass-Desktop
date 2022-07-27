import { useStore } from '@/infra/hooks/ui-store';
import { DialogCategory } from '@/infra/stores/common/share-ui';
import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { useState, FC } from 'react';
import { Card, SvgIconEnum, SvgImg } from '~ui-kit';

export const MidRosterBtn = () => <RosterBtn />;

export const BigRosterBtn = () => {
  const role = EduClassroomConfig.shared.sessionInfo.role;

  return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role) ? (
    <RosterBtn isLectureRoster={true} />
  ) : null;
};

const RosterBtn: FC<{ isLectureRoster?: boolean }> = ({ isLectureRoster = false }) => {
  const
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
        type={SvgIconEnum.REGISTER}
        onClick={handleClick}
        size={ICON_SIZE}
        style={{ cursor: 'pointer' }}
      />
    </Card>
  );
};
