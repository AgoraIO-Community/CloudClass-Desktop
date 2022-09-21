import { useAuth } from '@/app/hooks/useAuth';
import React, { FC } from 'react';

export const AuthLayout: FC = ({ children }) => {
  const { auth } = useAuth();
  React.useEffect(() => {
    auth();
  }, []);

  return <>{children}</>;
};
