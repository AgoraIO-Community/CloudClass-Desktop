import { useEffect, useRef, useState, useMemo } from 'react';

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

/**
 * figure out a position that the target can make use to be centered in the container which has the `bounds` class.
 * @param
 *  draggableHeight: target's height
 *  draggableWidth: target's width
 *  bounds: class of the container which the target will be centered in
 * @returns
 */
export const useDraggableDefaultCenterPosition = ({
  draggableHeight,
  draggableWidth,
  bounds,
}: {
  draggableWidth: number;
  draggableHeight: number;
  bounds?: string;
}) => {
  const innerSize = useMemo(() => {
    if (bounds) {
      const innerEle = document.querySelector(bounds);
      if (innerEle) {
        return {
          innerHeight: innerEle.clientHeight,
          innerWidth: innerEle.clientWidth,
        };
      }
    }
    return {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    };
  }, [window.innerHeight, window.innerWidth]);

  const rect = useMemo(() => {
    const { innerHeight, innerWidth } = innerSize || window;

    const x = (innerWidth - draggableWidth) / 2;

    const y = (innerHeight - draggableHeight) / 2;

    return { x, y, width: draggableWidth, height: draggableHeight };
  }, [draggableHeight, draggableWidth]);

  return rect;
};
