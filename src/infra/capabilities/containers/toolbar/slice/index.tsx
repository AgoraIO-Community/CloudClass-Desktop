import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { SvgImg, Slice, SvgIconEnum } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';

export const SliceContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const t = useI18n();
  const { sliceItems, handleSliceItem } = toolbarUIStore;

  const mappedItems = sliceItems.map((item) => {
    const { id, iconType, name } = item;
    return {
      id,
      icon: iconType ? <SvgImg type={iconType as SvgIconEnum} size={24} /> : <span />,
      name,
    };
  });

  return (
    <Slice
      value="tools"
      label={t('scaffold.slice')}
      icon={SvgIconEnum.TOOLS}
      slicersList={mappedItems}
      onClick={handleSliceItem}
    />
  );
});
