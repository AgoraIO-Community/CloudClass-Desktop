import { useStore } from '@classroom/infra/hooks/ui-store';
import { useEffectOnce } from '@classroom/infra/hooks/utilites';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

type Props = {
  children?: React.ReactNode;
};

const Room: FC<Props> = observer(({ children }) => {
  const { join } = useStore();

  useEffectOnce(() => {
    join();
  });

  return <React.Fragment>{children}</React.Fragment>;
});

export default Room;
