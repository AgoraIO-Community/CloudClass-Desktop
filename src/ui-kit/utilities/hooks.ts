import { useEffect, useRef, useState, useMemo } from 'react';

type UseWatchCallback<T> = (prev: T | undefined) => void;
type UseWatchConfig = {
  immediate: boolean;
};

export const useWatch = <T>(
  dep: T,
  callback: UseWatchCallback<T>,
  config: UseWatchConfig = { immediate: false },
) => {
  const { immediate } = config;

  const prev = useRef<T>();
  const inited = useRef(false);
  const stop = useRef(false);
  const execute = () => callback(prev.current);

  useEffect(() => {
    if (!stop.current) {
      if (!inited.current) {
        inited.current = true;
        if (immediate) {
          execute();
        }
      } else {
        execute();
      }
      prev.current = dep;
    }
  }, [dep]);

  return () => {
    stop.current = true;
  };
};

export const useUnMount = (cb: CallableFunction) => {
  useEffect(() => {
    return () => cb();
  }, []);
};

export const useMounted = () => {
  const mounted = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted.current;
};

export const useTimeout = (fn: CallableFunction, delay: number) => {
  const mounted = useMounted();

  const timer = useRef<any>(null);

  useEffect(() => {
    timer.current = setTimeout(() => {
      fn && mounted && fn();
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [timer]);
};

export const usePrevious = <Type>(value: Type) => {
  const previousValue = useRef<Type>(value);

  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return previousValue.current;
};

export const useDebounce = <T>(value: T, delay?: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useDraggableDefaultCenterPosition = (
  {
    draggableHeight,
    draggableWidth,
  }: {
    draggableWidth: number;
    draggableHeight: number;
  },
  innerSize?: {
    innerHeight: number;
    innerWidth: number;
  },
) => {
  const pos = useMemo(() => {
    const { innerHeight, innerWidth } = innerSize || window;

    const x = (innerWidth - draggableWidth) / 2;

    const y = (innerHeight - draggableHeight) / 2;

    // dont need returing width and height but need pass type checking
    return { x, y } as Record<'x' | 'y' | 'width' | 'height', number>;
  }, [draggableHeight, draggableWidth]);

  return pos;
};
