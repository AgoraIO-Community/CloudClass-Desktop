import { transI18n } from '@/infra/stores/common/i18n';
import classNames from 'classnames';
import { range } from 'lodash';
import {
  FC,
  MouseEvent,
  cloneElement,
  ReactElement,
  useState,
  useMemo,
  useContext,
  createContext,
} from 'react';
import { Button, CheckBox, Popover, Tree } from '~ui-kit';

const PanelStateContext = createContext({
  visiblePanelId: 0,
  onTrigger: (panelId: number) => {},
  getNextPanelId: (): number => 0,
});

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
  userId: i,
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
  const { visiblePanelId, onTrigger, getNextPanelId } = useContext(PanelStateContext);

  const panelId = useMemo(() => getNextPanelId(), []);

  const childBtn = useMemo(
    () =>
      cloneElement(children as ReactElement, {
        onClick: () => {
          onTrigger(panelId);
        },
      }),
    [children],
  );

  return (
    <Popover
      overlayClassName="breakout-room-group-panel"
      visible={visiblePanelId === panelId}
      placement="rightTop"
      content={
        <div className="panel-content py-2" style={{ width: 200, height: 200, overflow: 'scroll' }}>
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
      }>
      {childBtn}
    </Popover>
  );
};

type UserPanelProps = {
  onSelect: () => void;
};

const UserPanel: FC<UserPanelProps> = ({ children, onSelect }) => {
  const [panelVisible, setPanelVisible] = useState(false);

  const childBtn = useMemo(
    () =>
      cloneElement(children as ReactElement, {
        onClick: () => {
          setPanelVisible((visible) => !visible);
        },
      }),
    [children],
  );

  return (
    <Popover
      overlayClassName="breakout-room-group-panel"
      visible={panelVisible}
      placement="rightTop"
      content={
        <div className="panel-content py-2" style={{ width: 200, height: 200, overflow: 'scroll' }}>
          {userData.map(({ userId, userName }) => (
            <CheckBox key="" text={userName} value={userId} />
          ))}
        </div>
      }>
      {childBtn}
    </Popover>
  );
};

type Props = {
  onNext: () => void;
};

const usePanelState = () => {
  const [visiblePanelId, setVisiblePanelId] = useState(0);

  const panelState = useMemo(() => {
    let nextId = 0;
    return {
      visiblePanelId,
      onTrigger: (panelId: number) => {
        setVisiblePanelId((prevPanelId: number) => {
          if (prevPanelId === panelId) {
            return 0;
          }
          return panelId;
        });
      },
      getNextPanelId: () => {
        return Date.now() + nextId++;
      },
    };
  }, [visiblePanelId]);

  return panelState;
};

export const GroupSelect: FC<Props> = ({ onNext }) => {
  const handleAssign = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleMoveTo = () => {};
  const handleChangeTo = () => {};

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
                  <SuffixLink
                    className="pr-4"
                    onClick={handleAssign}
                    text={transI18n('breakout_room.assign')}
                  />
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
