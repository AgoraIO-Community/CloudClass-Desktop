import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';
import { HistoryStoreContext } from './../stores/index';

export const useHistoryBack = () => {
  const historyStore = useContext(HistoryStoreContext);
  const history = useHistory();
  const historyBackHandle = useCallback(() => {
    // There is no use history. Because of the history.length is inherited the browser's window.history. This will lead to goBack function back to visit other web sites. This is not we want to see.
    if (historyStore.length > 0) {
      history.goBack();
    } else {
      history.replace('/');
    }
  }, [history, historyStore.length]);
  return historyBackHandle;
};
