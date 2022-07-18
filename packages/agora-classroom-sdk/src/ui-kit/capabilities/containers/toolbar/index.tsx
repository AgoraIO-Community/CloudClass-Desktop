import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { Toolbar, ToolItem } from '~ui-kit';
import { PensContainer } from './pens';
import { ToolCabinetContainer } from './tool-cabinet';
import { BoardCleanersContainer } from './board-cleaners';
import { SliceContainer } from './slice';
import { ToolbarItemCategory } from '@/infra/stores/common/type';
export const WhiteboardToolbar = observer(() => {
  const {
    toolbarUIStore,
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
    boardUIStore
  } = useStore();
  const { activeTool, activeMap, tools, setTool } = toolbarUIStore;

  const mappedTools = tools.map((tool) => {
    if (tool.category === ToolbarItemCategory.PenPicker) {
      return {
        ...tool,
        component: () => {
          return <PensContainer />;
        },
      } as ToolItem;
    } else if (tool.category === ToolbarItemCategory.Cabinet) {
      return {
        ...tool,
        component: () => {
          return <ToolCabinetContainer />;
        },
      } as ToolItem;
    } else if (tool.category === ToolbarItemCategory.Eraser) {
      return {
        ...tool,
        component: () => {
          return <BoardCleanersContainer />;
        },
      } as ToolItem;
    } else if (tool.category === ToolbarItemCategory.Slice) {
      return {
        ...tool,
        component: () => {
          return <SliceContainer />;
        },
      } as ToolItem;
    }
    return tool as ToolItem;
  });

  return mappedTools.length > 0 ? (
    <div className='absolute bottom-0 w-full overflow-hidden' style={{ height: boardUIStore.boardAreaHeight, pointerEvents: 'none' }}>
      <Toolbar
        style={{ opacity: containedStreamWindowCoverOpacity, pointerEvents: 'all' }}
        active={activeTool}
        activeMap={activeMap}
        tools={mappedTools}
        onClick={setTool}
        defaultOpened={true}
      />
    </div>
  ) : null;
});
