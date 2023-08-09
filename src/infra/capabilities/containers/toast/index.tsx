import { observer } from 'mobx-react';
import { Toast } from '@classroom/ui-kit';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './index.css';
import { ToastType } from '@classroom/infra/stores/common/share';

export const ToastContainer = observer(() => {
  const { shareUIStore } = useStore();
  const { toastQueue, removeToast } = shareUIStore;

  return (
    <TransitionGroup className="fcr-flex fcr-justify-center fcr-absolute fcr-top-0 fcr-left-0 fcr-w-full fcr-h-full fcr-pointer-events-none">
      {toastQueue.map((value: ToastType, idx: number) => (
        <CSSTransition classNames="toast-animation" timeout={1000} key={`${value.id}`}>
          <Toast
            style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
            type={value.type as 'success' | 'error' | 'warning'}
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
