import { Chat } from '@/ui-kit/capabilities/containers/widget/slots';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { HandsUp } from '../hands-up';
import './index.css';

interface ChatH5Props {
  showHandsUp?: boolean;
}

export const ChatH5 = observer<FC<ChatH5Props>>(({ showHandsUp = false }) => {
  // 下面的逻辑是为了能够让 举手按钮提留在正确的位置，兼容每个设备浏览器底部的区域
  const [bottom, setBottom] = useState(65);
  const styles = useMemo<CSSProperties>(() => {
    return {
      position: 'absolute',
      right: 15,
      bottom: bottom,
    };
  }, [bottom]);

  useEffect(() => {
    let loopTime = 10000;
    const interval = 500;
    const timer = setInterval(() => {
      const inputBox = document.getElementsByClassName('fcr-hx-input-box');
      if (inputBox.length > 0) {
        const offsetHeight = (inputBox[0] as HTMLDivElement)?.offsetHeight;
        if (offsetHeight) {
          clearInterval(timer);
          setBottom(offsetHeight - 18 - 9);
        }
      }

      loopTime = loopTime - interval;
      // 防止im加载不上来导致无限循环
      if (loopTime < 0) {
        clearInterval(timer);
      }
    }, interval);
  }, []);

  return (
    <div className="im-section">
      <Chat />
      {showHandsUp && bottom ? <HandsUp style={styles} /> : null}
    </div>
  );
});
