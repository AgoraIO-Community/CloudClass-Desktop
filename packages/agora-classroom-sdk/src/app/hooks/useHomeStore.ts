import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import { HomeStore } from '../stores/home';

export type HomeContext = Record<string, HomeStore>;
export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(MobXProviderContext as React.Context<HomeContext>);
  return context.store;
};
