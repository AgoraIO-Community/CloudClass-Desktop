import { MobXProviderContext } from 'mobx-react';
import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PluginStore } from './store';

export type pluginContext = Record<string, PluginStore>;

export const usePluginStore = (): PluginStore => {
  const context = useContext<pluginContext>(MobXProviderContext);
  return context.store;
};

// 获取当前时间
// const getCurrentTimestamp = () => (window.performance ? performance.now() : Date.now());

export const useTimeCounter = () => {
  const [duration, setDuration] = useState<number>(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = useCallback(() => {
    setDuration((duration) => duration - 1);
  }, []);

  const play = useCallback(() => {
    stop();
    timer.current = setInterval(() => {
      step();
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
  }, []);

  const reset = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      setDuration((_) => 0);
    }
  }, []);

  useEffect(() => {
    (!duration || duration <= 0) && reset();
  }, [duration]);

  return { duration, setDuration, play, stop, reset };
};
