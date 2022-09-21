import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { isH5Browser } from '../utils/browser';

export const useH5AndPcRedirect = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // h5
    if (isH5Browser() && !location.pathname.match('/h5')) {
      const url = window.location.hash.replace('#/', '/h5/');
      history.push(url);
      return;
    }
    // pc
    if (!isH5Browser() && location.pathname.match('/h5')) {
      const url = window.location.hash.replace('#/h5', '');
      history.push(url);
    }
  }, []);
};
