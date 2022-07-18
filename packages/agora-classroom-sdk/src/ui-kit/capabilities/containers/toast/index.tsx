import { observer } from 'mobx-react';
import { Toast } from '~ui-kit';
import { useStore } from '@/infra/hooks/ui-store';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './index.css';
import { ToastType } from '@/infra/stores/common/share-ui';

export const ToastContainer = observer(() => {
  const { shareUIStore } = useStore();
  const { toastQueue, removeToast } = shareUIStore;

  return (
    <TransitionGroup style={{ justifyContent: 'center', display: 'flex' }}>
      {toastQueue.map((value: ToastType, idx: number) => (
        <CSSTransition classNames="toast-animation" timeout={1000} key={`${value.id}`}>
          <Toast
            style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
            type={value.type}
            closeToast={() => {
              removeToast(value.id);
            }}>
            {value.desc}
          </Toast>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
});
