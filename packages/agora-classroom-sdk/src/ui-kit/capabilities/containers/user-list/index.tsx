import { FC } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { OverlayWrap, Roster, RosterTable } from '~ui-kit';

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
    <OverlayWrap>
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
    </OverlayWrap>
  );
});

const RosterTableContainer: FC<{}> = observer(() => {
  const { rosterUIStore } = useStore();
  const { rosterFunctions: functions, userList, clickRowAction } = rosterUIStore;

  return <RosterTable list={userList} functions={functions} onActionClick={clickRowAction} />;
});
