import { useEffect } from 'react';

export const useEffectOnce = (effect: any) => {
  useEffect(effect, [])
}