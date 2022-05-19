import { observer } from 'mobx-react';
import { FC, Fragment, MouseEvent, useContext, useMemo, useState, useRef } from 'react';
import { cloneDeep } from 'lodash';
import { GroupState } from 'agora-edu-core';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { transI18n } from '@/infra/stores/common/i18n';
import { Button, MultiRootTree, TreeNode, TreeModel, CheckBox } from '~ui-kit';
import classnames from 'classnames';
import { usePanelState, PanelStateContext } from '../panel';
import { GroupPanel } from '../group';
import { UserPanel } from '../user';
import './index.css';
import { ConfirmPanel } from '../confirm-panel';
import { ConfirmDialog } from '../confirm-dialog';

type LinkButtonProps = {
  text: string;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  hoverText?: string;
  style?: any;
  hoverClassName?: string;
};

const LinkButton = ({
  onClick,
  text,
  hoverText = text,
  hoverClassName,
  style,
  className,
}: LinkButtonProps) => {
  const [hover, setHover] = useState(false);

  const cls = classnames('link-btn text-center py-1', className, hover && hoverClassName);

  return (
    <div
      style={style}
      className={cls}
      onClick={onClick}
      onMouseOver={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}>
      {hover && hoverText ? hoverText : text}
    </div>
  );
};

type GroupButtonsProps = {
  groupUuid: string;
  btns: React.ReactNode;
};

const GroupButtons: FC<GroupButtonsProps> = observer(({ groupUuid, btns }) => {
  const { groupUIStore } = useStore();

  const userPanelId = 'user-panel' + groupUuid;
  const confirmPanelId = 'confirm-panel' + groupUuid;
  const { visiblePanelId } = useContext(PanelStateContext);

  const {
    MAX_USER_COUNT,
    students,
    setGroupUsers,
    groupState,
    notGroupedCount,
    joinSubRoom,
    getGroupUserCount,
    currentSubRoom,
    toastFullOfStudents,
    groupDetails,
  } = groupUIStore;

  const { closeAll } = useContext(PanelStateContext);

  const existGroupName = groupDetails.get(groupUuid)?.groupName;

  const groupName = existGroupName || transI18n('breakout_room.not_grouped');

  return (
    <div
      className="flex"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      {btns}
      {groupState === GroupState.OPEN ? (
        currentSubRoom === groupUuid ? (
          <div className="link-width py-1 pr-4 text-center hl-text">
            {transI18n('breakout_room.joined')}
          </div>
        ) : existGroupName ? (
          <ConfirmPanel
            panelId={confirmPanelId}
            title={transI18n('breakout_room.confirm_join_group_content', {
              reason: groupName,
            })}
            onOk={() => {
              groupUuid && joinSubRoom(groupUuid);
            }}
            onCancel={() => {
              closeAll();
            }}>
            <LinkButton
              className="pr-4 hl-text text-right"
              text={groupUuid && transI18n('fcr_group_button_join')}
            />
          </ConfirmPanel>
        ) : null
      ) : (
        <UserPanel
          panelId={userPanelId}
          groupUuid={groupUuid}
          users={students.map((v) => v)}
          limitCount={MAX_USER_COUNT}
          onError={(message) => {
            message === 'FULL' && toastFullOfStudents();
          }}
          onChange={(users) => {
            setGroupUsers(groupUuid, users);
          }}>
          <LinkButton
            className={visiblePanelId === userPanelId ? 'active-bg px-4' : 'hl-text px-4'}
            text={transI18n('breakout_room.assign')}
          />
        </UserPanel>
      )}
    </div>
  );
});

type UserButtonsProps = {
  groupUuid: string;
  userUuid: string;
};

const UserButtons: FC<UserButtonsProps> = observer(({ userUuid, groupUuid }) => {
  const { groupUIStore } = useStore();
  const moveToPanelId = 'group-panel-move-to' + userUuid;
  const changeToPanelId = 'group-panel-change-to' + userUuid;

  const { groupState, groups, moveUserToGroup, interchangeGroup } = groupUIStore;

  const { closeAll, visiblePanelId } = useContext(PanelStateContext);

  const filteredGroups = useMemo(() => {
    const newGroups = cloneDeep(groups.filter(({ id }) => id && id !== groupUuid));

    newGroups.forEach((group) => {
      const { children } = group;

      group.children = children.filter(({ id }) => id !== userUuid);
    });

    return newGroups;
  }, [groups, groupUuid]);

  return (
    <div className="flex">
      <GroupPanel
        panelId={moveToPanelId}
        groups={filteredGroups}
        onNodeClick={(node) => {
          moveUserToGroup(groupUuid, node.id, userUuid);
          closeAll();
        }}>
        <LinkButton
          className={visiblePanelId === moveToPanelId ? 'active-bg' : undefined}
          text={transI18n('breakout_room.move_to')}
        />
      </GroupPanel>
      {groupState === GroupState.OPEN && groupUuid && (
        <GroupPanel
          panelId={changeToPanelId}
          groups={filteredGroups}
          canExpand
          onNodeClick={(node, level) => {
            if (level === 1) {
              interchangeGroup(userUuid, node.id);
              closeAll();
            }
          }}>
          <LinkButton
            className={visiblePanelId === changeToPanelId ? 'active-bg' : undefined}
            text={transI18n('breakout_room.change_to')}
          />
        </GroupPanel>
      )}
    </div>
  );
});

type RenameInputProps = {
  text: string;
  editing: boolean;
  onSubmit: (text: string) => void;
};

const RenameInput: FC<RenameInputProps> = ({ editing, text, onSubmit }) => {
  const [value, setValue] = useState(() => text);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    onSubmit(value);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit(value);
    }
  };

  return editing ? (
    <input
      maxLength={16}
      className="px-1 group-rename-input"
      ref={(ref) => {
        ref?.focus();
      }}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  ) : (
    <Fragment>{text}</Fragment>
  );
};

type GroupTreeNodeProps = {
  node: TreeModel;
  level: number;
};

const GroupTreeNode: FC<GroupTreeNodeProps> = ({ node, level }) => {
  const { groupUIStore } = useStore();
  const { renameGroupName, removeGroup, getUserGroupUuid } = groupUIStore;

  const [editing, setEditing] = useState(false);

  const [mouseEnter, setMouseEnter] = useState(false);

  const handleRename = () => {
    setEditing(true);
  };

  const handleRemove = () => {
    removeGroup(node.id);
  };

  const renameBtn = (
    <LinkButton
      className="rename-btn"
      key="rename"
      text={transI18n('breakout_room.rename')}
      onClick={handleRename}
    />
  );

  const removeBtn = (
    <LinkButton
      className="remove-btn"
      key="remove"
      text={transI18n('breakout_room.remove')}
      onClick={handleRemove}
    />
  );

  const tialNode =
    level === 0 && node.id ? (
      <GroupButtons groupUuid={node.id} btns={mouseEnter ? [renameBtn, removeBtn] : []} />
    ) : level === 1 ? (
      <GroupButtons
        groupUuid={node.id}
        btns={
          mouseEnter ? (
            <UserButtons groupUuid={getUserGroupUuid(node.id) as string} userUuid={node.id} />
          ) : (
            []
          )
        }
      />
    ) : (
      <div className="py-1">&nbsp;</div>
    );

  const childrenLength = node?.children?.length;

  let content =
    level === 0 ? (
      <>
        <RenameInput
          key={`group-rename-input-${node.id}`}
          editing={editing}
          text={node.text}
          onSubmit={(text) => {
            setEditing(false);
            renameGroupName(node.id, text);
          }}
        />
        {editing ? null : (
          <span className="tree-node-tips">
            {childrenLength
              ? transI18n('breakout_room.group_current_has_students', {
                  reason: `${childrenLength}`,
                })
              : transI18n('breakout_room.group_current_empty')}
          </span>
        )}
      </>
    ) : (
      node.text
    );

  const notJoined = (node as any).notJoined;

  if (level === 1 && notJoined) {
    content += ` ${transI18n('breakout_room.not_accepted')}`;
  }

  return (
    <TreeNode
      onMouseEnter={() => {
        setMouseEnter(true);
      }}
      onMouseLeave={() => {
        setMouseEnter(false);
      }}
      content={content}
      tail={!notJoined ? tialNode : <div className="py-1">&nbsp;</div>}
    />
  );
};

type Props = {
  onNext: () => void;
};

export const GroupSelect: FC<Props> = observer(({ onNext }) => {
  const { groupUIStore } = useStore();

  const { groupState, groups, isCopyContent, setCopyContent, stopGroup } = groupUIStore;

  const [showConfirmDialog, setConfirmDialog] = useState<boolean>(false);

  const panelState = usePanelState();

  const [broadcastVisible, setBroadcastVisible] = useState(false);

  return (
    <div className="h-full w-full flex flex-col">
      {showConfirmDialog ? (
        <ConfirmDialog
          onOk={() => {
            stopGroup(onNext).finally(() => {
              setConfirmDialog(false);
            });
          }}
          onCancel={() => {
            setConfirmDialog(false);
          }}
          onCancelText={transI18n('breakout_room.confirm_stop_group_sure')}>
          <div className="stop-group-main-text">
            <div className="stop-group-main-title">
              {transI18n('breakout_room.confirm_stop_group_title')}
            </div>
            <div className="stop-group-sub-title">
              {transI18n('breakout_room.confirm_stop_group_content')}
            </div>
          </div>
        </ConfirmDialog>
      ) : null}
      <div
        className="overflow-auto py-2 group-scroll-overflow"
        style={{
          height: broadcastVisible ? 330 : 354,
          flexGrow: broadcastVisible ? 0 : 1,
        }}
        onClick={() => {
          panelState.closeAll();
        }}>
        <PanelStateContext.Provider value={panelState}>
          <MultiRootTree
            childClassName="breakout-room-tree pl-4"
            data={groups}
            renderNode={(node, level) => <GroupTreeNode node={node} level={level} />}
            showArrowAlways
          />
        </PanelStateContext.Provider>
      </div>
      {groupState === GroupState.OPEN ? null : (
        <div className="flex justify-start items-center group-tips-wrap">
          <CheckBox
            checked={isCopyContent}
            onChange={(e: any) => {
              setCopyContent(e.target.checked);
            }}
          />
          <span className="group-tips">{transI18n('breakout_room.group_tips')}</span>
        </div>
      )}
      <Footer
        onNext={onNext}
        setConfirmDialog={setConfirmDialog}
        broadcastVisible={broadcastVisible}
        setBroadcastVisible={setBroadcastVisible}
      />
    </div>
  );
});

const Footer: FC<{
  onNext: () => void;
  setConfirmDialog: (v: boolean) => void;
  broadcastVisible: boolean;
  setBroadcastVisible: (v: boolean) => void;
}> = observer(({ onNext, setConfirmDialog, broadcastVisible, setBroadcastVisible }) => {
  const { groupUIStore } = useStore();

  const { addGroup, groupState, startGroup, stopGroup, broadcastMessage } = groupUIStore;

  const [messageText, setMessageText] = useState('');
  const cursorRef = useRef<boolean>(false);

  const handleGroupState = () => {
    if (groupState === GroupState.OPEN) {
      setConfirmDialog(true);
    } else {
      if (cursorRef.current) return;
      cursorRef.current = true;
      startGroup().finally(() => {
        cursorRef.current = false;
      });
    }
  };

  const reCreateButton = (
    <Button
      size="xs"
      type="secondary"
      className="rounded-btn mr-2 recreate-btn"
      onClick={() => {
        stopGroup(onNext);
      }}>
      {transI18n('breakout_room.re_create')}
    </Button>
  );

  const addGroupButton = (
    <Button
      size="xs"
      type="secondary"
      className="rounded-btn mr-2 add-group-btn"
      onClick={addGroup}>
      {transI18n('breakout_room.add_group')}
    </Button>
  );

  const startButton = (
    <Button
      size="xs"
      type={groupState === GroupState.OPEN ? 'danger' : 'primary'}
      className="rounded-btn start-btn"
      onClick={handleGroupState}>
      {groupState === GroupState.OPEN
        ? transI18n('breakout_room.stop')
        : transI18n('breakout_room.start')}
    </Button>
  );

  const broadcastButton = (
    <Button
      size="xs"
      type="secondary"
      className="rounded-btn mr-2 px-1 broadcast-btn"
      onClick={() => {
        setBroadcastVisible(true);
      }}>
      {transI18n('breakout_room.broadcast_message')}
    </Button>
  );

  const handleSubmit = () => {
    broadcastMessage(messageText);
    setBroadcastVisible(false);
  };

  const initial = (
    <div className="flex justify-end px-4 py-2">
      {reCreateButton}
      {addGroupButton}
      {startButton}
    </div>
  );

  const started = (
    <div className="flex justify-end px-4 py-2">
      {broadcastButton}
      {startButton}
    </div>
  );

  const broadcast = (
    <Fragment>
      <div className="px-4">
        <BroadcastInput
          limit={300}
          onChange={(text) => {
            setMessageText(text);
          }}
        />
      </div>
      <div className="flex justify-end px-4 py-2">
        <Button
          size="xs"
          type="secondary"
          className="rounded-btn mr-2"
          onClick={() => {
            setBroadcastVisible(false);
          }}>
          {transI18n('breakout_room.cancel')}
        </Button>
        <Button size="xs" type="primary" className="rounded-btn" onClick={handleSubmit}>
          {transI18n('breakout_room.send')}
        </Button>
      </div>
    </Fragment>
  );

  let footer = null;

  if (groupState === GroupState.OPEN) {
    if (broadcastVisible) {
      footer = broadcast;
    } else {
      footer = started;
    }
  } else {
    footer = initial;
  }

  return <div className="group-select-footer">{footer}</div>;
});

const BroadcastInput = ({
  limit,
  onChange,
}: {
  limit: number;
  onChange: (text: string) => void;
}) => {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (value.length > limit) {
      value = value.substring(0, limit);
    }
    if (text !== value) {
      setText(value);

      onChange(value);
    }
  };

  return (
    <div className="breakout-room-broadcast-input border rounded-sm p-1 relative">
      <textarea
        className="w-full h-full"
        value={text}
        onChange={handleChange}
        placeholder={transI18n('breakout_room.send_to_all_placeholder')}
      />
      <span className="absolute" style={{ bottom: 4, right: 4 }}>
        {text.length}/{limit}
      </span>
    </div>
  );
};
