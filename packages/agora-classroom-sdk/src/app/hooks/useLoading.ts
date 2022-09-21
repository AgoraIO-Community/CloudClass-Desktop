import { useEffect } from 'react';
import { useHomeStore } from './useHomeStore';

export const useLoading = () => {
  const { loading, setLoading } = useHomeStore();
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  return { loading, setLoading };
};
