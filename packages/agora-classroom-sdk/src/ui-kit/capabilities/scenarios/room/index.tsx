import { useStore } from '@/infra/hooks/use-edu-stores';
import { useEffectOnce } from '@/infra/hooks/utilites';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

type Props = {
  children?: React.ReactNode;
};

const Room: FC<Props> = observer(({ children }) => {
  const { initialize, join, destroy } = useStore();

  useEffectOnce(() => {
    initialize();
    join();
    return destroy;
  });

  return <React.Fragment>{children}</React.Fragment>;
});

export default Room;
