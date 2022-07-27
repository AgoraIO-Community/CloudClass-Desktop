import { createContext } from 'react';
import { FcrTheme } from './type';

export const themeContext = createContext({} as FcrTheme);

const { Provider, Consumer } = themeContext;

export const ThemeProvider = Provider;

export const ThemeConsumer = Consumer;

export type { FcrTheme } from './type';