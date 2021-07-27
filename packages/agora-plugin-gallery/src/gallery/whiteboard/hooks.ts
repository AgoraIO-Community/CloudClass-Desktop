import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import { PluginStore } from './store';

export type pluginContext = Record<string, PluginStore>;

export const usePluginStore = (): PluginStore => {
  const context = useContext<pluginContext>(MobXProviderContext);
  return context.store;
};
