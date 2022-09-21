import { useCallback } from 'react';
import { useHistory } from 'react-router';

export const useHistoryBack = () => {
  const history = useHistory();

  const historyBackHandle = useCallback(() => {
    if (history.length > 1) {
      history.goBack();
    } else {
      history.replace('/');
    }
  }, [history]);

  return historyBackHandle;
};
