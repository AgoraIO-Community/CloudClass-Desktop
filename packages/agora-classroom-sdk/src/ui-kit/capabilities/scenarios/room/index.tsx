import { useStore } from '@/infra/hooks/use-edu-stores';
import { useEffectOnce } from '@/infra/hooks/utilites';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

const Room: FC = observer(({ children }) => {
  const { initialize, join, destroy } = useStore();

  useEffectOnce(() => {
    initialize();
    join();
    return destroy;
  });

  return <React.Fragment>{children}</React.Fragment>;
});

export default Room;
