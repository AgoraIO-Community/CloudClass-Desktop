import { ReactNode } from 'react';

export type RenderFunction = () => ReactNode;

export const getRenderPropValue = (propValue?: ReactNode | RenderFunction): ReactNode => {
  if (!propValue) {
    return null;
  }

  const isRenderFunction = typeof propValue === 'function';
  if (isRenderFunction) {
    return (propValue as RenderFunction)();
  }

  return propValue;
};
