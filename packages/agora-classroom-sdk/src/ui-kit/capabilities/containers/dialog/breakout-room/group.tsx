import { FC, ReactElement, MouseEvent, useContext } from 'react';
import { MultiRootTree, TreeModel, TreeNode } from '~ui-kit';
import { Panel, PanelStateContext } from './panel';

type GroupPanelProps = {
  groups: { text: string; id: string }[];
  panelId?: string;
  onOpen?: () => void;
  onClose?: (users: string[]) => void;
  onChange?: (users: string[]) => void;
  canExpand?: boolean;
  onNodeClick?: (node: TreeModel, level: number) => void;
};

export const GroupPanel: FC<GroupPanelProps> = ({
  children,
  groups,
  onChange,
  onOpen,
  onClose,
  canExpand,
  onNodeClick,
  panelId,
}) => {
  return (
    <Panel
      panelId={panelId}
      className="breakout-room-group-panel"
      trigger={children as ReactElement}
      onClose={() => {}}>
      <div
        className="panel-content py-2"
        style={{ width: 200, height: 200, overflow: 'scroll' }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        <MultiRootTree
          childClassName="breakout-room-tree px-4 py-1"
          disableExpansion={!canExpand}
          data={groups}
          renderNode={(node, level) => (
            <TreeNode
              content={node.text}
              tail={level === 0 ? <span>{node.children?.length || 0}</span> : undefined}
              onClick={() => {
                onNodeClick && onNodeClick(node, level);
              }}
            />
          )}
          showArrowAlways
        />
      </div>
    </Panel>
  );
};
