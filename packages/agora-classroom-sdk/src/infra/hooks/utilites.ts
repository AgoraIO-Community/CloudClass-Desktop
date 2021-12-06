import { useRef, useEffect } from 'react';

export const useInterval = (fun: CallableFunction, delay: number, start: boolean) => {
  const myRef = useRef<any>(null);
  useEffect(() => {
    myRef.current = fun;
  }, [fun]);
  useEffect(() => {
    const timer = setInterval(() => {
      myRef.current(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [start, delay]);
};

export const useTimout = (fun: CallableFunction, delay: number, start: boolean) => {
  const myRef = useRef<any>(null);
  useEffect(() => {
    myRef.current = fun;
  }, [fun]);
  useEffect(() => {
    let timer: null | ReturnType<typeof setTimeout> = null;
    if (start) {
      timer = setTimeout(() => {
        myRef.current(timer);
      }, delay);
    }
    return () => {
      timer && clearTimeout(timer);
    };
  }, [start, delay]);
};

export const useEffectOnce = (effect: any) => {
  useEffect(effect, []);
};
