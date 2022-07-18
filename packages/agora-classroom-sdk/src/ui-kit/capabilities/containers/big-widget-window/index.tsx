import { useStore } from '@/infra/hooks/ui-store';
import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import useMeasure from 'react-use-measure';
import StreamWindowsContainer from '../stream-windows-container';


export const BigWidgetWindowContainer: FC = observer(() => {
  const { streamWindowUIStore, boardUIStore } = useStore();
  const [measureRef, bounds] = useMeasure();

  useEffect(() => {
    streamWindowUIStore.setMiddleContainerBounds(bounds);
  }, [bounds]);
  return (
    <div
      className="w-full absolute flex-shrink-0 middle-container"
      style={{ height:  boardUIStore.boardAreaHeight, bottom: 0, pointerEvents: 'none' }}
      ref={measureRef}>
      <StreamWindowsContainer />
    </div>
  );
});