import { HomeStore } from '@/app/stores/home';
import { MobXProviderContext } from 'mobx-react';
import React, { DependencyList, useContext, useMemo } from 'react';
import { interactionThrottleHandler } from '../utils/interaction';

export type HomeContext = Record<string, HomeStore>;

export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(MobXProviderContext as React.Context<HomeContext>);
  return context.store;
};

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
