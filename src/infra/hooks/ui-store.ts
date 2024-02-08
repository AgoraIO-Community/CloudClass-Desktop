import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../stores/common';

export function useStore(): EduClassroomUIStore {
  const UIStore = React.useContext(EduContext.shared).UIStore;
  return UIStore;
}
