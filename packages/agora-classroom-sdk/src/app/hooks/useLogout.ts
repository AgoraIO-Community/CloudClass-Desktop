import { useCallback } from 'react';
import { useHistory } from 'react-router';

export const useLogout = () => {
  const history = useHistory();

  const logout = useCallback(async () => {
    history.replace('/logout');
  }, []);

  return { logout };
};
