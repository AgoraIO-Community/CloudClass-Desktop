import { useStore } from '@classroom/infra/hooks/ui-store';
import { Scheduler } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { ComponentLevelRulesMobile } from '../../config';
import './index.mobile.css';
export const ToastContainerMobile = observer(() => {
  const {
    shareUIStore: { toastQueue, isLandscape },
  } = useStore();
  const currToast = toastQueue[0];

  const [visible, setVisible] = useState(false);
  const delayTaskRef = useRef<Scheduler.Task | null>(null);
  useEffect(() => {
    if (currToast) {
      delayTaskRef.current?.stop();
      setVisible(true);
      delayTaskRef.current = Scheduler.shared.addDelayTask(() => {
        setVisible(false);
      }, 3000);
    }
  }, [toastQueue, currToast]);
  return (
    <div
      style={{
        opacity: visible ? '1' : '0',
        zIndex: ComponentLevelRulesMobile.Level3,
        background: currToast?.type === 'info' ? '#4262FF' : '#000',
      }}
      className={`fcr-mobile-toast-container ${
        isLandscape ? 'fcr-mobile-toast-container-landscape' : ''
      }`}>
      {currToast?.desc}
    </div>
  );
});
