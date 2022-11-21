import { createElement, useContext, createContext } from 'react';
import { Z_INDEX_RULES } from './style-config';

export type I18nLanguage = 'zh' | 'en';

export const makeContainer = (name: string) => {
  const Context = createContext(null as any);

  return {
    Context,
    Provider: <T>({ children, value }: { children: React.ReactNode; value: T }) => {
      Context.displayName = name;
      return createElement(Context.Provider, { value }, children);
    },
    useContext: <T>() => {
      const context = useContext<T>(Context);
      if (!context) {
        throw new Error(`useContext must be used within a ${name}`);
      }
      return context;
    },
  };
};

export const getOS = () => {
  let ua = navigator.userAgent,
    isWindowsPhone = /(?:Windows Phone)/.test(ua),
    isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
    isAndroid = /(?:Android)/.test(ua),
    isFireFox = /(?:Firefox)/.test(ua),
    isChrome = /(?:Chrome|CriOS)/.test(ua),
    isTablet =
      /(?:iPad|PlayBook)/.test(ua) ||
      (isAndroid && !/(?:Mobile)/.test(ua)) ||
      (isFireFox && /(?:Tablet)/.test(ua)) ||
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)) ||
      'ontouchend' in document,
    isPhone = /(?:iPhone)/.test(ua) && !isTablet,
    isPc = !isPhone && !isAndroid && !isSymbian;
  return {
    isTablet: isTablet,
    isPhone: isPhone,
    isPc: isPc,
  };
};

export const Z_INDEX_CONST = Z_INDEX_RULES;
