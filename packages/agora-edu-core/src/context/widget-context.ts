import { useCoreContext } from './core';

export const useWidgetContext = () => {
  const {widgetStore} = useCoreContext()

  return {
    widgets: widgetStore.widgets
  }
}