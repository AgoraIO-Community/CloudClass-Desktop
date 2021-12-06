import { observer } from 'mobx-react';
import { Toast } from '~ui-kit';
import { useStore } from '~hooks/use-edu-stores';
import { ToastType } from 'agora-edu-core';

export const ToastContainer = observer(() => {
  const { shareUIStore } = useStore();
  const { toastQueue, removeToast } = shareUIStore;

  return (
    <div style={{ justifyContent: 'center', display: 'flex' }}>
      {toastQueue.map((value: ToastType, idx: number) => (
        <Toast
          style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
          key={`${value.id}`}
          type={value.type}
          closeToast={() => {
            removeToast(value.id);
          }}>
          {value.desc}
        </Toast>
      ))}
    </div>
  );
});
