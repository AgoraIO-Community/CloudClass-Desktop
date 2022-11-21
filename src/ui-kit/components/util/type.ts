import { CSSProperties } from 'react';
import { SvgIconEnum } from '../svg-img';

export interface BaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
}

export const tuple = <T extends string[]>(...args: T) => args;

export type ElementOf<T> = T extends (infer E)[] ? E : T extends readonly (infer F)[] ? F : never;

export type IconWithState = {
  icon: SvgIconEnum;
  color?: string;
};
