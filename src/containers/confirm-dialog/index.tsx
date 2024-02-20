import { iterateMap } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/hooks/ui-store';
import { ConfirmDialog, ConfirmDialogProps } from './confirm-dialog';

export const ClassRoomDialogContainer = observer(() => {
  const {
    layoutUIStore: { dialogMap, deleteDialog },
  } = useStore();

  const { list } = iterateMap(dialogMap, {
    onMap: (_key, item) => {
      return { id: _key, props: item };
    },
  });

  return (
    <>
      {list.map(({ id, props }) => {
        const confirmDialog = props as ConfirmDialogProps;
        return (
          <ConfirmDialog
            key={id}
            {...confirmDialog}
            onCancel={() => {
              deleteDialog(id);
              confirmDialog.onCancel?.();
            }}
            onOk={() => {
              deleteDialog(id);
              confirmDialog.onOk?.();
              confirmDialog.onCancel?.();
            }}></ConfirmDialog>
        );
      })}
    </>
  );
});
