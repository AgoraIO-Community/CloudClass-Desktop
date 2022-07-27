import { useContext } from 'react';
import { uiConfigContext } from '../api/providers';

export const useUIConfig = () => {
  const uiConfig = useContext(uiConfigContext);

  return uiConfig;
};
