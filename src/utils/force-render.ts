import { useEffect, useState } from 'react';
import uuid from 'uuid';

export const useForceRenderWhenVisibilityChanged = () => {
  const [renderKey, setRenderKey] = useState(uuid.v4());
  const onVisibilityChanged = () => {
    if (document.visibilityState === 'visible') {
      setRenderKey(uuid.v4());
    }
  };
  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChanged);
    return () => document.removeEventListener('visibilitychange', onVisibilityChanged);
  }, []);
  return { renderKey };
};
