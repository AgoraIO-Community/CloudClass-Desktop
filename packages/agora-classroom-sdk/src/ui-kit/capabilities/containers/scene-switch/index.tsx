import { useStore } from '@/infra/hooks/ui-store';
import { transI18n } from '~ui-kit';
import { observer } from 'mobx-react';
import { FC, useEffect } from 'react';
import { Card, Loading } from '~ui-kit';
import './index.css';

type Props = {
  children?: React.ReactNode;
};

export const SceneSwitch: FC<Props> = observer(({ children }) => {
  const { groupUIStore, shareUIStore } = useStore();

  useEffect(() => {
    shareUIStore.setLayoutReady(!groupUIStore.joiningSubRoom);
  }, [groupUIStore.joiningSubRoom]);

  return (
    <div className="w-full h-full bg-white">
      {/* Loading */}
      {groupUIStore.joiningSubRoom ? <PageLoading /> : children}
    </div>
  );
});

const PageLoading = () => {
  const { layoutUIStore } = useStore();

  return (
    <div className="scene-switch-loading">
      <Card
        className="absolute inline-flex flex-col inset-auto p-4"
        style={{
          width: 'unset!important',
          height: 'unset!important',
          borderRadius: 12,
        }}>
        <Loading />
        <p className="m-0 text-level1">
          {layoutUIStore.isInSubRoom
            ? transI18n('fcr_group_joining', {
                reason: layoutUIStore.currentSubRoomName,
              })
            : transI18n('fcr_group_back_main_room')}
        </p>
      </Card>
    </div>
  );
};
