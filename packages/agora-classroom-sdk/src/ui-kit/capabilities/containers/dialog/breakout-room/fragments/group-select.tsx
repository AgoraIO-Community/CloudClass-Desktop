import { transI18n } from '@/infra/stores/common/i18n';
import classNames from 'classnames';
import { range } from 'lodash';
import { FC, MouseEvent, ReactElement, useContext, useState } from 'react';
import { Button, CheckBox, Tree } from '~ui-kit';
import { Panel, usePanelState, PanelStateContext } from '../panel';

const data = range(1, 32).map((i) => ({
  text: '小组' + i,
  children: [
    {
      text: '小明',
    },
  ],
}));

const groupData = range(1, 32).map((i) => ({
  text: '小组' + i,
}));

const userData = range(1, 20).map((i) => ({
  userId: `${i}`,
  userName: '学生' + i,
}));

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
  onSelect: () => void;
};

const GroupPanel: FC<GroupPanelProps> = ({ children, onSelect }) => {
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
          data={groupData}
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
  onSelect: (users: Set<string>) => void;
};

const UserPanel: FC<UserPanelProps> = ({ children, onSelect }) => {
  const [users, setUsers] = useState(() => new Set<string>());

  return (
    <Panel className="breakout-room-group-panel" trigger={children as ReactElement}>
      <div
        className="panel-content py-2 overflow-scroll flex flex-wrap"
        style={{ width: 300, height: 200 }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        {userData.map(({ userId, userName }) => (
          <div
            key={userId}
            style={{ width: '33.33%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <CheckBox
              gap={1}
              text={userName}
              value={userId}
              onChange={() => {
                const newUsers = new Set(users);
                newUsers.add(userId);
                setUsers(newUsers);
                onSelect(users);
              }}
              checked={users.has(userId)}
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

export const GroupSelect: FC<Props> = ({ onNext }) => {
  // const handleAssign = (e: MouseEvent) => {
  // };

  // const handleMoveTo = () => { };
  // const handleChangeTo = () => { };

  const panelState = usePanelState();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-grow overflow-scroll py-2">
        <PanelStateContext.Provider value={panelState}>
          <Tree
            childClassName="pl-4"
            data={data}
            renderSuffix={(_, level) => {
              if (level === 0) {
                return (
                  <UserPanel onSelect={() => {}}>
                    <SuffixLink className="pr-4" text={transI18n('breakout_room.assign')} />
                  </UserPanel>
                );
              } else if (level === 1) {
                return (
                  <div className="flex">
                    <GroupPanel onSelect={() => {}}>
                      <SuffixButton text={transI18n('breakout_room.move_to')} />
                    </GroupPanel>
                    <GroupPanel onSelect={() => {}}>
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
};
