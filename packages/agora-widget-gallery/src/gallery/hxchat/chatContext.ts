import React from 'react';
import { EduClassroomUIStore } from 'agora-classroom-sdk';
import { WidgetChatUIStore } from './store';

export const Context = React.createContext<{
  uiStore: EduClassroomUIStore | undefined;
  widgetStore: WidgetChatUIStore | undefined;
}>({ uiStore: undefined, widgetStore: undefined });
