import { useStore } from '@/infra/hooks/use-edu-stores';
import { transI18n } from '@/infra/stores/common/i18n';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { FC, MouseEvent, ReactElement, useMemo, useState } from 'react';
import { Button, CheckBox, Tree } from '~ui-kit';
import { Panel, usePanelState, PanelStateContext } from '../panel';

type ButtonProps = {
  text: string;
  onClick?: (e: MouseEvent) => void;
  className?: string;
};

const SuffixLink = ({ onClick, text, className }: ButtonProps) => {
  const cls = classNames('suffix-link py-1 px-2', className);
  return (
    <span className={cls} onClick={onClick}>
      {text}
    </span>
  );
};

const SuffixButton = ({ onClick, text }: ButtonProps) => {
  return (
    <div className="suffix-btn py-1 px-2" onClick={onClick}>
      {text}
    </div>
  );
};

type GroupPanelProps = {
  groups: { text: string; id: string }[];
  onSelect: () => void;
};

const GroupPanel: FC<GroupPanelProps> = ({ children, onSelect, groups }) => {
  const groupsWithoutUsers = useMemo(() => {
    return groups.map(({ text, id }) => {
      return { text, id };
    });
  }, []);

  return (
    <Panel className="breakout-room-group-panel" trigger={children as ReactElement}>
      <div
        className="panel-content py-2"
        style={{ width: 200, height: 200, overflow: 'scroll' }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        <Tree
          childClassName="px-4 py-1"
          disableExpansion
          data={groupsWithoutUsers}
          gap={2}
          onClick={onSelect}
          renderSuffix={(node, level) => {
            if (level === 0) {
              return <span>{node.children?.length || 0}</span>;
            }
          }}
        />
      </div>
    </Panel>
  );
};

type UserPanelProps = {
  users: { userUuid: string; userName: string }[];
  onSelect: (users: Set<string>) => void;
};

const UserPanel: FC<UserPanelProps> = ({ children, onSelect, users }) => {
  const [checkedUsers, setCheckedUsers] = useState(() => new Set<string>());

  return (
    <Panel className="breakout-room-group-panel" trigger={children as ReactElement}>
      <div
        className="panel-content py-2 overflow-scroll flex flex-wrap justify-start"
        style={{ width: 300, height: 200 }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        {users.map(({ userUuid, userName }) => (
          <div
            key={userUuid}
            style={{ width: '33.33%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <CheckBox
              gap={1}
              text={userName}
              value={userUuid}
              onChange={() => {
                const newCheckedUsers = new Set(checkedUsers);
                if (newCheckedUsers.has(userUuid)) {
                  newCheckedUsers.delete(userUuid);
                } else {
                  newCheckedUsers.add(userUuid);
                }
                setCheckedUsers(newCheckedUsers);
                onSelect(checkedUsers);
              }}
              checked={checkedUsers.has(userUuid)}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
};

type Props = {
  onNext: () => void;
};

export const GroupSelect: FC<Props> = observer(({ onNext }) => {
  const { groupUIStore } = useStore();

  const { groups, students } = groupUIStore;

  const panelState = usePanelState();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-grow overflow-scroll py-2">
        <PanelStateContext.Provider value={panelState}>
          <Tree
            childClassName="pl-4"
            data={groups}
            renderSuffix={(_, level) => {
              if (level === 0) {
                return (
                  <UserPanel onSelect={() => {}} users={students}>
                    <SuffixLink className="pr-4" text={transI18n('breakout_room.assign')} />
                  </UserPanel>
                );
              } else if (level === 1) {
                return (
                  <div className="flex">
                    <GroupPanel onSelect={() => {}} groups={groups}>
                      <SuffixButton text={transI18n('breakout_room.move_to')} />
                    </GroupPanel>
                    <GroupPanel onSelect={() => {}} groups={groups}>
                      <SuffixButton text={transI18n('breakout_room.change_to')} />
                    </GroupPanel>
                  </div>
                );
              }
            }}
          />
        </PanelStateContext.Provider>
      </div>
      <div className="flex justify-between px-4 py-2">
        <div>
          <Button type="secondary" className="rounded-btn mr-2">
            {transI18n('breakout_room.re_create')}
          </Button>
          <Button type="secondary" className="rounded-btn">
            {transI18n('breakout_room.add_group')}
          </Button>
        </div>
        <Button type="primary" className="rounded-btn" onClick={onNext}>
          {transI18n('breakout_room.start')}
        </Button>
      </div>
    </div>
  );
});
