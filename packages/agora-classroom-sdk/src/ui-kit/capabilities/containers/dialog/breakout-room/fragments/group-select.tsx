import { useStore } from '@/infra/hooks/use-edu-stores';
import { transI18n } from '@/infra/stores/common/i18n';
import { observer } from 'mobx-react';
import { FC, Fragment, MouseEvent, useContext, useMemo, useState, useRef } from 'react';
import { Button, MultiRootTree, TreeNode, TreeModel } from '~ui-kit';
import { usePanelState, PanelStateContext } from '../panel';
import { GroupPanel } from '../group';
import { UserPanel } from '../user';
import { GroupState } from 'agora-edu-core';
import { cloneDeep } from 'lodash';
import React from 'react';

type LinkButtonProps = {
  text: string;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  hoverText?: string;
};

const LinkButton = ({ onClick, text, hoverText = text }: LinkButtonProps) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="link-btn py-1 px-4"
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
  } = groupUIStore;

  const [toggle, setToggle] = useState(false);

  const mouseHandler = (t: boolean) => () => {
    setToggle(t);
  };

  const userCount = groupUuid ? getGroupUserCount(groupUuid) : notGroupedCount;
  return (
    <div
      className="flex"
      onMouseEnter={mouseHandler(true)}
      onMouseLeave={mouseHandler(false)}
      onClick={(e) => {
        e.stopPropagation();
      }}>
      {toggle ? btns : null}
      {groupState === GroupState.OPEN ? (
        currentSubRoom === groupUuid ? (
          <div className="py-1 px-4">{transI18n('breakout_room.joined')}</div>
        ) : (
          <LinkButton
            className="pr-4"
            text={`${userCount}`}
            onClick={() => groupUuid && joinSubRoom(groupUuid)}
            hoverText={groupUuid && transI18n('breakout_room.join_group')}
          />
        )
      ) : (
        <UserPanel
          groupUuid={groupUuid}
          users={students.map((v) => v)}
          limitCount={MAX_USER_COUNT}
          onError={(message) => {
            message === 'FULL' && toastFullOfStudents();
          }}
          onChange={(users) => {
            setGroupUsers(groupUuid, users);
          }}>
          <LinkButton className="pr-4" text={transI18n('breakout_room.assign')} />
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

  const { groupState, groups, moveUserToGroup, interchangeGroup } = groupUIStore;

  const { closeAll } = useContext(PanelStateContext);

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
        groups={filteredGroups}
        onNodeClick={(node) => {
          moveUserToGroup(groupUuid, node.id, userUuid);
          closeAll();
        }}>
        <LinkButton text={transI18n('breakout_room.move_to')} />
      </GroupPanel>
      {groupState === GroupState.OPEN && groupUuid && (
        <GroupPanel
          groups={filteredGroups}
          canExpand
          onNodeClick={(node, level) => {
            if (level === 1) {
              interchangeGroup(userUuid, node.id);
              closeAll();
            }
          }}>
          <LinkButton text={transI18n('breakout_room.change_to')} />
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
      className="px-1"
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

  const handleRename = () => {
    setEditing(true);
  };

  const handleRemove = () => {
    removeGroup(node.id);
  };

  const renameBtn = (
    <LinkButton
      key="rename"
      className="pr-4"
      text={transI18n('breakout_room.rename')}
      onClick={handleRename}
    />
  );

  const removeBtn = (
    <LinkButton
      key="remove"
      className="pr-4"
      text={transI18n('breakout_room.remove')}
      onClick={handleRemove}
    />
  );

  const tialNode =
    level === 0 && node.id ? (
      <GroupButtons groupUuid={node.id} btns={[renameBtn, removeBtn]} />
    ) : level === 1 ? (
      <UserButtons groupUuid={getUserGroupUuid(node.id) as string} userUuid={node.id} />
    ) : (
      <div className="py-1">&nbsp;</div>
    );

  let content =
    level === 0 ? (
      <RenameInput
        key={`group-rename-input-${node.id}`}
        editing={editing}
        text={node.text}
        onSubmit={(text) => {
          setEditing(false);
          renameGroupName(node.id, text);
        }}
      />
    ) : (
      node.text
    );

  if (level === 1 && (node as any).notJoined) {
    content += ` ${transI18n('breakout_room.not_accepted')}`;
  }

  return <TreeNode content={content} tail={tialNode} />;
};

type Props = {
  onNext: () => void;
};

export const GroupSelect: FC<Props> = observer(({ onNext }) => {
  const { groupUIStore } = useStore();

  const { groups } = groupUIStore;

  const panelState = usePanelState();
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-grow overflow-scroll py-2">
        <PanelStateContext.Provider value={panelState}>
          <MultiRootTree
            childClassName="pl-4"
            data={groups}
            renderNode={(node, level) => <GroupTreeNode node={node} level={level} />}
          />
        </PanelStateContext.Provider>
      </div>
      <Footer onNext={onNext} />
    </div>
  );
});

const Footer: FC<{ onNext: () => void }> = observer(({ onNext }) => {
  const { groupUIStore } = useStore();

  const { addGroup, groupState, startGroup, stopGroup, broadcastMessage } = groupUIStore;

  const [broadcastVisible, setBroadcastVisible] = useState(false);

  const [messageText, setMessageText] = useState('');
  const cursorRef = useRef<boolean>(false);

  const handleGroupState = () => {
    if (cursorRef.current) return;
    cursorRef.current = true;
    if (groupState === GroupState.OPEN) {
      stopGroup().finally(() => {
        cursorRef.current = false;
      });
      onNext();
    } else {
      startGroup().finally(() => {
        cursorRef.current = false;
      });
    }
  };

  const reCreateButton = (
    <Button
      type="secondary"
      className="rounded-btn mr-2"
      onClick={() => {
        stopGroup();
        onNext();
      }}>
      {transI18n('breakout_room.re_create')}
    </Button>
  );

  const addGroupButton = (
    <Button type="secondary" className="rounded-btn" onClick={addGroup}>
      {transI18n('breakout_room.add_group')}
    </Button>
  );

  const startButton = (
    <Button type="primary" className="rounded-btn" onClick={handleGroupState}>
      {groupState === GroupState.OPEN
        ? transI18n('breakout_room.stop')
        : transI18n('breakout_room.start')}
    </Button>
  );

  const broadcastButton = (
    <Button
      type="secondary"
      className="rounded-btn mr-2"
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
    <div className="flex justify-between px-4 py-2">
      <div>
        {reCreateButton}
        {addGroupButton}
      </div>
      {startButton}
    </div>
  );

  const started = (
    <div className="flex justify-between px-4 py-2">
      {/* {broadcastButton} */}
      <div />
      {startButton}
    </div>
  );

  const broadcast = (
    <React.Fragment>
      <div className="px-4">
        <BroadcastInput
          limit={150}
          onChange={(text) => {
            setMessageText(text);
          }}
        />
      </div>
      <div className="flex justify-end px-4 py-2">
        <Button
          type="secondary"
          className="rounded-btn mr-2"
          onClick={() => {
            setBroadcastVisible(false);
          }}>
          {transI18n('breakout_room.cancel')}
        </Button>
        <Button type="primary" className="rounded-btn" onClick={handleSubmit}>
          {transI18n('breakout_room.send')}
        </Button>
      </div>
    </React.Fragment>
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

  return footer;
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
    if (value.length > 150) {
      value = value.substring(0, 150);
    }
    if (text !== value) {
      setText(value);

      onChange(value);
    }
  };

  return (
    <div className="border rounded-sm p-1 relative">
      <textarea className="w-full h-full" value={text} onChange={handleChange} />
      <span className="absolute" style={{ bottom: 4, right: 4 }}>
        {text.length}/{limit}
      </span>
    </div>
  );
};
