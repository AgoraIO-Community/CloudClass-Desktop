import { useStore } from '@/infra/hooks/ui-store';
import { LectureRoomStreamUIStore } from '@/infra/stores/lecture/stream-ui';
import { OneToOneStreamUIStore } from '@/infra/stores/one-on-one/stream-ui';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Aside } from '~ui-kit';

export const BigClassAside: FC = observer(({ children }) => {
  const { streamUIStore } = useStore();
  return (
    <Aside
      style={{ width: (streamUIStore as LectureRoomStreamUIStore).teacherVideoStreamSize.width }}>
      {children}
    </Aside>
  );
});


export const OneToOneClassAside: FC = observer(({ children }) => {
  const { streamUIStore } = useStore();
  return (
    <Aside
      style={{ width: (streamUIStore as OneToOneStreamUIStore).videoStreamSize.width }}>
      {children}
    </Aside>);
})