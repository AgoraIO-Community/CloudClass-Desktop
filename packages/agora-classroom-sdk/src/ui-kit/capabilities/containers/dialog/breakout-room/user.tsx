import React, { FC, ReactElement, useState, MouseEvent } from 'react';
import { CheckBox, Search, SvgImg, transI18n } from '~ui-kit';
import { Panel } from './panel';

type UserPanelProps = {
  groupUuid?: string;
  users: { userUuid: string; userName: string; groupUuid: string | undefined }[];
  limitCount: number;
  onOpen?: () => void;
  onClose?: (users: string[]) => void;
  onChange?: (users: string[]) => void;
  onError?: (message: string) => void;
  panelId?: string;
  children?: React.ReactNode;
};

export const UserPanel: FC<UserPanelProps> = ({
  children,
  users,
  limitCount,
  onChange,
  onOpen,
  onClose,
  onError,
  groupUuid,
  panelId,
}) => {
  const [checkedUsers, setCheckedUsers] = useState(() => new Set<string>());
  const [keyword, setKeyword] = useState('')

  return (
    <Panel
      panelId={panelId}
      className="breakout-room-group-panel"
      trigger={children as ReactElement}
      onClose={() => {
        onClose && onClose(Array.from(checkedUsers));
      }}
      onOpen={onOpen}>
      <div style={{ width: users.length ? 300 : 'auto', height: users.length ? 200 : 'auto' }}>
        <div
          className="panel-content py-2 px-2 overflow-auto flex flex-wrap justify-start"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
          }}>
          {users.length ? (
            <Search
              prefix={<SvgImg type="search" />}
              value={keyword}
              onSearch={setKeyword}
              inputPrefixWidth={32}
              placeholder={transI18n('scaffold.search')}
            />
          ) : (<span className='user-panel-empty'>{transI18n('breakout_room.user_panel_empty')}</span>)}  
          {users.filter(item => {
            if (!keyword) return true
            return item.userName.includes(keyword)
          }).map(({ userUuid, userName, groupUuid: userGroupUuid }) => (
            <div key={userUuid} style={{ width: '33.33%' }}>
              <CheckBox
                style={{ width: '130%' }}
                gap={2}
                text={userName}
                value={userUuid}
                onChange={() => {
                  const newCheckedUsers = new Set(checkedUsers);
                  let isFull = false;
                  if (newCheckedUsers.has(userUuid)) {
                    newCheckedUsers.delete(userUuid);
                  } else {
                    newCheckedUsers.size < limitCount
                      ? newCheckedUsers.add(userUuid)
                      : (isFull = true);
                  }
                  setCheckedUsers(newCheckedUsers);
                  onChange && onChange(Array.from(newCheckedUsers));
                  isFull && onError && onError('FULL');
                }}
                disabled={userGroupUuid ? userGroupUuid !== groupUuid : false}
                checked={
                  checkedUsers.has(userUuid) ||
                  (userGroupUuid ? userGroupUuid !== groupUuid : false)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};
