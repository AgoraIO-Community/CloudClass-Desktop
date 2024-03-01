import { ComponentLevelRules } from '@classroom/configs/config';
import { useStore } from '@classroom/hooks/ui-store';
import { Card, Loading } from '@classroom/ui-kit';
import { transI18n } from 'agora-common-libs';
import { ClassroomState } from 'agora-edu-core';
import { observer } from 'mobx-react';

export const GroupLoading = () => {
  const { layoutUIStore } = useStore();

  return (
    <div className="fcr-w-full fcr-h-full fcr-bg-white">
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
    </div>
  );
};
export const LoadingContainer = observer(() => {
  const {
    classroomStore: {
      connectionStore: { classroomState },
    },
  } = useStore();
  return classroomState !== ClassroomState.Connected ? (
    <div
      style={{ zIndex: ComponentLevelRules.Level3 }}
      className="fcr-w-screen fcr-h-screen fcr-fixed fcr-left-0 fcr-t-0 fcr-flex fcr-items-center fcr-justify-center">
      <Card width={90} height={90}>
        <Loading></Loading>
      </Card>
    </div>
  ) : null;
});
