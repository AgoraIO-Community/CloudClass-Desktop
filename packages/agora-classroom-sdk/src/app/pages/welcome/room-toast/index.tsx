import { useHomeStore } from '@/app/hooks';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import './index.css';

export const RoomToast = observer(() => {
  const homeStore = useHomeStore();
  const Toast = useMemo(() => {
    const { roomListToast } = homeStore;
    if (roomListToast && roomListToast.length) {
      return (
        <div className="toast-list">
          {roomListToast.map((v, i) => {
            return (
              <div key={v.id + i} className="toast-item">
                <span>{v.desc}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  }, [homeStore.roomListToast]);

  return Toast;
});
