import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { SvgImg, useI18n, BoardCleaners } from '~ui-kit';

export const BoardCleanersContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const t = useI18n();
  const { boardCleanerItems, handleBoradCleaner, activeTool } = toolbarUIStore;

  const mappedItems = boardCleanerItems.map((item) => {
    const { id, iconType, name } = item;
    return {
      id,
      icon: iconType ? (
        <SvgImg type={activeTool === id ? iconType + '-active' : iconType} size={26} />
      ) : <span />,
      name,
    };
  });

  return (
    <BoardCleaners
      value="eraser"
      label={t('scaffold.eraser')}
      icon="eraser"
      cleanersList={mappedItems}
      onClick={handleBoradCleaner}
      activeItem={activeTool}
      isActive={activeTool === 'eraser'}
    />
  );
});
