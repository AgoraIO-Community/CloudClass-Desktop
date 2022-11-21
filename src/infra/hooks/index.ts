import { DependencyList, useMemo } from 'react';
import { interactionThrottleHandler } from '../utils/interaction';

export const useInteractionThrottleHandler = <T>(
  func: T,
  options: { limitMs?: number; limitFunc?: () => void },
  deps: DependencyList,
) => {
  return useMemo(() => {
    return interactionThrottleHandler(func, options.limitFunc || (() => {}), {
      limitMs: options.limitMs,
    }) as T;
  }, deps);
};
