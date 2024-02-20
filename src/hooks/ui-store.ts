import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../uistores';

export function useStore(): EduClassroomUIStore {
  const UIStore = React.useContext(EduContext.shared).UIStore;
  return UIStore;
}
