import { EffectCallback, useEffect } from 'react';

export const useUnMount = (cb: CallableFunction) => {
  useEffect(() => {
    return () => cb()
  }, [])
}