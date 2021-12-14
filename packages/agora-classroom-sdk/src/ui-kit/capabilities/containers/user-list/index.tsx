import { FC } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { Roster, RosterTable } from '~ui-kit';

export type RosterContainerProps = {
  onClose: () => void;
};

export const RosterContainer: FC<RosterContainerProps> = observer(({ onClose }) => {
  const { rosterUIStore } = useStore();
  const {
    teacherName,
    setKeyword,
    searchKeyword,
    rosterFunctions: functions,
    carouselProps,
  } = rosterUIStore;

  return (
    <Roster
      bounds=".track-bounds"
      offsetTop={27}
      hostname={teacherName}
      keyword={searchKeyword}
      carouselProps={carouselProps}
      functions={functions}
      onClose={onClose}
      onKeywordChange={setKeyword}>
      <RosterTableContainer />
    </Roster>
  );
});

const RosterTableContainer: FC<unknown> = observer(() => {
  const { rosterUIStore } = useStore();
  const {
    rosterFunctions: functions,
    userList,
    clickRowAction,
    isColumnsInteractive,
  } = rosterUIStore;

  return (
    <RosterTable
      list={userList}
      functions={functions}
      onActionClick={clickRowAction}
      columnInteractive={isColumnsInteractive}
    />
  );
});
