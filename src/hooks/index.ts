import { DependencyList, useEffect, useMemo, useRef } from 'react';
import { clickAnywhere } from '../utils';
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

export const useClickAnywhere = (cb: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      return clickAnywhere(ref.current, cb);
    }
  }, []);

  return ref;
};
