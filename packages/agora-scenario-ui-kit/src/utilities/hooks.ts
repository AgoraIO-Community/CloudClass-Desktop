import { EffectCallback, useEffect } from 'react';

export const useUnMount = (cb: EffectCallback) => {
  useEffect(cb, [])
}