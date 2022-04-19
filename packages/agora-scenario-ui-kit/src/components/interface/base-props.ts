import { CSSProperties } from 'react';

export interface BaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
