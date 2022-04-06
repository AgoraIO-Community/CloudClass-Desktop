import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { SvgImg, t, BoardCleaners } from '~ui-kit';

export const BoardCleanersContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const { boardCleanerItems, onBoradCleanerClick, activeTool } = toolbarUIStore;

  const mappedItems = boardCleanerItems.map((item) => {
    const { id, icon, iconType, name } = item;
    return {
      id,
      icon: icon ? (
        icon
      ) : (
        <SvgImg type={activeTool === id ? iconType + '-active' : iconType} size={26} />
      ),
      name,
    };
  });

  return (
    <BoardCleaners
      value="eraser"
      label={t('scaffold.eraser')}
      icon="eraser"
      cleanersList={mappedItems}
      onClick={onBoradCleanerClick}
      activeItem={activeTool}
      isActive={activeTool === 'eraser'}
    />
  );
});
