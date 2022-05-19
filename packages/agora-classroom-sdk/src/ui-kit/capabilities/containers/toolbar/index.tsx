import { ToolbarItemCategory } from '@/infra/stores/common/toolbar-ui';
import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { Toolbar, ToolItem } from '~ui-kit';
import { PensContainer } from './pens';
import { ToolCabinetContainer } from './tool-cabinet';
import { BoardCleanersContainer } from './board-cleaners';

export const WhiteboardToolbar = observer(({ children }: any) => {
  const {
    toolbarUIStore,
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
  } = useStore();
  const { activeTool, activeMap, tools, setTool } = toolbarUIStore;

  const mappedTools = tools.map((tool) => {
    if (tool.category === ToolbarItemCategory.PenPicker) {
      return {
        ...tool,
        component: (props: any) => {
          return <PensContainer {...props} />;
        },
      } as ToolItem;
    } else if (tool.category === ToolbarItemCategory.Cabinet) {
      return {
        ...tool,
        component: (props: any) => {
          return <ToolCabinetContainer {...props} />;
        },
      } as ToolItem;
    } else if (tool.category === ToolbarItemCategory.Eraser) {
      return {
        ...tool,
        component: (props: any) => {
          return <BoardCleanersContainer {...props} />;
        },
      } as ToolItem;
    }
    return tool as ToolItem;
  });

  return mappedTools.length > 0 ? (
    <Toolbar
      style={{ opacity: containedStreamWindowCoverOpacity }}
      active={activeTool}
      activeMap={activeMap}
      tools={mappedTools}
      onClick={setTool}
      defaultOpened={true}
    />
  ) : null;
});
