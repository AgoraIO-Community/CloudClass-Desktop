import { EffectCallback, useEffect } from 'react';

export const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};
