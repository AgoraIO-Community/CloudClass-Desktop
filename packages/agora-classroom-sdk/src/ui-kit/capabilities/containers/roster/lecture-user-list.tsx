import { FC, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { Roster, InfiniteScrollRosterTable } from '~ui-kit';
import { EduLectureUIStore } from '@/infra/stores/lecture';

export type LectureRosterContainerProps = {
  onClose: () => void;
};

export const LectureRosterContainer: FC<LectureRosterContainerProps> = observer(({ onClose }) => {
  const { rosterUIStore } = useStore() as EduLectureUIStore;
  const {
    teacherName,
    setKeyword,
    searchKeyword,
    rosterFunctions: functions,
    carouselProps,
    uiOverrides,
    fetchNextUsersList,
  } = rosterUIStore;

  const { width } = uiOverrides;

  const keyWordChangeHandle = useCallback(
    (keyword: string) => {
      setKeyword(keyword);
      fetchNextUsersList({ nextId: null }, true);
    },
    [fetchNextUsersList],
  );

  return (
    <Roster
      width={width}
      bounds="classroom-track-bounds"
      hostname={teacherName}
      keyword={searchKeyword}
      carouselProps={carouselProps}
      functions={functions}
      onClose={onClose}
      onKeywordChange={keyWordChangeHandle}>
      <RosterTableContainer />
    </Roster>
  );
});

const RosterTableContainer: FC<unknown> = observer(() => {
  const { rosterUIStore } = useStore() as EduLectureUIStore;
  const {
    rosterFunctions: functions,
    userList,
    clickRowAction,
    fetchNextUsersList,
    hasMoreUsers,
    resetUsersList,
  } = rosterUIStore;
  useEffect(() => {
    fetchNextUsersList({ nextId: null }, true);
    return () => {
      resetUsersList();
    };
  }, []);
  return (
    <InfiniteScrollRosterTable
      list={userList}
      hasMore={hasMoreUsers}
      onFetch={fetchNextUsersList}
      functions={functions}
      onActionClick={clickRowAction}
    />
  );
});
