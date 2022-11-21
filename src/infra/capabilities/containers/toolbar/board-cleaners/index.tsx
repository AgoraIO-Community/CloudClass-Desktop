import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { SvgImg, BoardCleaners, SvgIconEnum } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';

export const BoardCleanersContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const t = useI18n();
  const { boardCleanerItems, handleBoradCleaner, activeTool } = toolbarUIStore;

  const mappedItems = boardCleanerItems.map((item) => {
    const { id, iconType, name } = item;
    const isActive = activeTool === id;

    return {
      id,
      icon: iconType ? (
        <SvgImg
          type={iconType as SvgIconEnum}
          size={26}
          colors={isActive ? { iconPrimary: InteractionStateColors.allow } : {}}
        />
      ) : (
        <span />
      ),
      name,
    };
  });

  return (
    <BoardCleaners
      value="eraser"
      label={t('scaffold.eraser')}
      icon={SvgIconEnum.ERASER}
      cleanersList={mappedItems}
      onClick={handleBoradCleaner}
      activeItem={activeTool}
      isActive={activeTool === 'eraser'}
    />
  );
});
