import { useStore } from '@classroom/infra/hooks/ui-store';
import { transI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { FC, useEffect } from 'react';
import { Card, Loading } from '@classroom/ui-kit';
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
    <div className="fcr-w-full fcr-h-full fcr-bg-white">
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
        className="fcr-absolute fcr-inline-flex fcr-flex-col fcr-inset-auto fcr-p-4"
        style={{
          width: 'unset!important',
          height: 'unset!important',
          borderRadius: 12,
        }}>
        <Loading />
        <p className="fcr-m-0 fcr-text-level1">
          {layoutUIStore.currentSubRoomName
            ? transI18n('fcr_group_joining', {
                reason: layoutUIStore.currentSubRoomName,
              })
            : transI18n('fcr_group_back_main_room')}
        </p>
      </Card>
    </div>
  );
};
