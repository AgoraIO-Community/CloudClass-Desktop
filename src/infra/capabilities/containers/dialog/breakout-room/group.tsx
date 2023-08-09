import { FC, ReactElement, MouseEvent } from 'react';
import { MultiRootTree, TreeModel, TreeNode } from '@classroom/ui-kit';
import { Panel } from './panel';
import { useI18n } from 'agora-common-libs';

type GroupPanelProps = {
  groups: { text: string; id: string }[];
  panelId?: string;
  onOpen?: () => void;
  onClose?: (users: string[]) => void;
  onChange?: (users: string[]) => void;
  canExpand?: boolean;
  onNodeClick?: (node: TreeModel, level: number) => void;
  children?: React.ReactNode;
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
  const transI18n = useI18n();
  return (
    <Panel
      panelId={panelId}
      className="breakout-room-group-panel"
      trigger={children as ReactElement}
      onClose={() => {}}>
      <div
        className="panel-content fcr-py-2"
        style={{ width: 200, height: 200, overflow: 'auto' }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        <MultiRootTree
          childClassName="breakout-room-tree fcr-px-4 fcr-py-1"
          disableExpansion={!canExpand}
          data={groups}
          renderNode={(node, level) => (
            <TreeNode
              content={node.text}
              tail={
                level === 0 ? (
                  <>
                    <span className="tree-node-tips">
                      {node.children?.length
                        ? transI18n('breakout_room.group_current_has_students', {
                            reason: `${node.children?.length}`,
                          })
                        : transI18n('breakout_room.group_current_empty')}
                    </span>
                  </>
                ) : undefined
              }
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
