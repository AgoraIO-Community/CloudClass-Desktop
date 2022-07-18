import React from 'react';
import { WidgetChatUIStore } from './chatStore';

export const Context = React.createContext<{
  widgetStore: WidgetChatUIStore | undefined;
}>({ widgetStore: undefined });
