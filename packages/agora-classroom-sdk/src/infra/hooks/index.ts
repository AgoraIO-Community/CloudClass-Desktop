import { HomeStore } from '@/infra/stores/home';
import { MobXProviderContext } from 'mobx-react';
import { createContext, useContext, DependencyList, useMemo } from 'react';
import { UIStore } from '@/infra/stores/ui';
import { interactionThrottleHandler } from 'agora-edu-core';

export type HomeContext = Record<string, HomeStore>;

export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(MobXProviderContext);
  return context.store;
};

export const UIContext = createContext<UIStore>(new UIStore());

export const useUIStore = () => useContext(UIContext);

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
