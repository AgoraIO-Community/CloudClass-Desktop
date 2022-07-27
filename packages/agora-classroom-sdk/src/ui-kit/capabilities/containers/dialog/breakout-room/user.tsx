import React, { FC, ReactElement, useState, MouseEvent } from 'react';
import { CheckBox, Search, SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
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
  const [keyword, setKeyword] = useState('');

  return (
    <Panel
      panelId={panelId}
      className="breakout-room-group-panel"
      trigger={children as ReactElement}
      onClose={() => {
        onClose && onClose(Array.from(checkedUsers));
      }}
      onOpen={onOpen}>
      <div
        style={{
          width: users.length ? 214 : 122,
          height: users.length ? 200 : 50,
          position: 'relative',
        }}>
        {users.length ? (
          <div className="group-search-wrap">
            <Search
              prefix={<SvgImg type={SvgIconEnum.SEARCH} size={18} />}
              value={keyword}
              onSearch={setKeyword}
              inputPrefixWidth={32}
              placeholder={transI18n('scaffold.search')}
            />
          </div>
        ) : (
          <div className="user-panel-empty">{transI18n('breakout_room.user_panel_empty')}</div>
        )}
        {users.length ? (
          <div
            className="panel-content py-2 px-2 overflow-auto"
            style={{
              height: 'calc(100% - 20px)',
            }}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}>
            <div className="flex flex-wrap justify-start">
              {users
                .filter((item) => {
                  if (!keyword) return true;
                  return item.userName.includes(keyword);
                })
                .map(({ userUuid, userName, groupUuid: userGroupUuid }) => (
                  <div key={userUuid} style={{ width: '50%' }}>
                    <CheckBox
                      className="group-user-checkbox"
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
                      checked={checkedUsers.has(userUuid) || !!userGroupUuid}
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};
