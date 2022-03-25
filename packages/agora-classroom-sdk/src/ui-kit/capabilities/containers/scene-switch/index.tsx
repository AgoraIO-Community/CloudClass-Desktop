import { useStore } from '@/infra/hooks/use-edu-stores';
import { transI18n } from '@/infra/stores/common/i18n';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Card, Loading } from '~ui-kit';

type Props = {};

export const SceneSwitch: FC<Props> = observer(({ children }) => {
  const { groupUIStore } = useStore();

  return (
    <div className="w-full h-full bg-white">
      {/* Loading */}
      {groupUIStore.joiningSubRoom ? <PageLoading /> : children}
    </div>
  );
});

const PageLoading = () => {
  return (
    <div className="page-loading">
      <Card width={120} height={120} className="card-loading-position flex flex-col">
        <Loading></Loading>
        <p className="m-0">{transI18n('breakout_room.joining')}</p>
      </Card>
    </div>
  );
};
