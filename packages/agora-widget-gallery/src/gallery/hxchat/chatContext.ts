import React from 'react';
import { WidgetChatUIStore } from './store';

type EduClassroomUIStore = any;

export const Context = React.createContext<{
  uiStore: EduClassroomUIStore | undefined;
  widgetStore: WidgetChatUIStore | undefined;
}>({ uiStore: undefined, widgetStore: undefined });
