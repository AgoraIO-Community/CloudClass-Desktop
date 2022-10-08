import { RoomStoreContext } from '@/app/stores';
import { observer } from 'mobx-react';
import { useContext, useMemo } from 'react';
import './index.css';

export const RoomToast = observer(() => {
  const { roomToastList } = useContext(RoomStoreContext);
  const Toast = useMemo(() => {
    if (roomToastList && roomToastList.length) {
      return (
        <div className="toast-list">
          {roomToastList.map((toast, i) => {
            return (
              <div key={toast.id + i} className="toast-item">
                <span>{toast.desc}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  }, [roomToastList]);

  return Toast;
});
