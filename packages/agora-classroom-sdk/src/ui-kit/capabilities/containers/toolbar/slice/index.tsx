import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { SvgImg, t, Slice } from '~ui-kit';

export const SliceContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const { sliceItems, handleSliceItem } = toolbarUIStore;

  const mappedItems = sliceItems.map((item) => {
    const { id, icon, iconType, name } = item;
    return {
      id,
      icon: icon ? icon : <SvgImg type={iconType} size={24} />,
      name,
    };
  });

  return (
    <Slice
      value="tools"
      label={t('scaffold.slice')}
      icon="tools"
      slicersList={mappedItems}
      onClick={handleSliceItem}
    />
  );
});
