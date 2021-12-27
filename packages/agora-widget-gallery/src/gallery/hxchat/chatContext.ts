import { EduClassroomUIStore } from 'agora-edu-core';
import React from 'react';
import { WidgetChatUIStore } from './store';

export const Context = React.createContext<{
  uiStore: EduClassroomUIStore | undefined;
  widgetStore: WidgetChatUIStore | undefined;
}>({ uiStore: undefined, widgetStore: undefined });
