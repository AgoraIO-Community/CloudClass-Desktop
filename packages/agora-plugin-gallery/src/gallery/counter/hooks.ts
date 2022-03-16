import { MobXProviderContext } from 'mobx-react';
import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PluginStore } from './store';

export type pluginContext = Record<string, PluginStore>;

export const usePluginStore = (): PluginStore => {
  const context = useContext<pluginContext>(MobXProviderContext);
  return context.store;
};

// 获取当前时间
const getCurrentTimestamp = () => (window.performance ? performance.now() : Date.now());

export const useTimeCounter = () => {
  const [duration, setDuration] = useState<number>(0);
  const currentTime = useRef(getCurrentTimestamp());
  const timer = useRef<number | null>(null);

  const step = useCallback(() => {
    let currentStepTime = getCurrentTimestamp();
    if ((currentStepTime - currentTime.current) / 1000 > 1) {
      setDuration((duration) => duration - 1);
      currentTime.current = currentStepTime;
    }
    timer.current = window.requestAnimationFrame(step);
  }, []);

  const play = useCallback(() => {
    stop();
    currentTime.current = getCurrentTimestamp(); // 初始化时间戳
    step();
  }, []);

  const stop = useCallback(() => {
    if (timer.current) {
      window.cancelAnimationFrame(timer.current);
    }
  }, []);

  const reset = useCallback(() => {
    if (timer.current) {
      window.cancelAnimationFrame(timer.current);
      setDuration((_) => 0);
    }
  }, []);

  useEffect(() => {
    !duration && timer.current && window.cancelAnimationFrame(timer.current);
  }, [duration]);

  return { duration, setDuration, play, stop, reset };
};
