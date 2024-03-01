import { ComponentLevelRules } from '@classroom/configs/config';
import { useStore } from '@classroom/hooks/ui-store';
import { DialogCategory } from '@classroom/uistores/share';
import { ConfirmDialogAction } from '@classroom/uistores/type';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import React from 'react';

export const AfterClassDialog = observer(() => {
  const {
    notificationUIStore: { setLeaveRoom },
  } = useStore();
  const transI18n = useI18n();

  return (
    <div
      className="fcr-after-class-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRules.Level3 }}>
      <div className="fcr-after-class-mobile-dialog">
        <div className="fcr-after-class-mobile-dialog-img"></div>
        <h1>{transI18n('fcr_H5_status_upcoming')}</h1>
        <h2>{transI18n('fcr_H5_tips_chat_book')}</h2>
        <div className="fcr-after-class-mobile-dialog-btn" onClick={() => setLeaveRoom(true)}>
          {transI18n('fcr_h5_label_gotit')}
        </div>
      </div>
    </div>
  );
});
export const DialogContainer: React.FC<unknown> = observer(() => {
  const { shareUIStore } = useStore();
  const { dialogQueue } = shareUIStore;
  const transI18n = useI18n();

  return (
    <React.Fragment>
      {dialogQueue
        .filter(
          (dialog) =>
            dialog.category === DialogCategory.ErrorGeneric ||
            dialog.category === DialogCategory.Confirm,
        )
        .map(({ id, props, category }) => {
          let dialogProps: GenericErrorDialogProps;
          if (category === DialogCategory.Confirm) {
            const confirmProps = props as ConfirmDialogProps;
            dialogProps = {
              title: confirmProps.title,
              content: confirmProps.content,
              okBtnText: confirmProps.opts.btnText?.ok ?? transI18n('toast.confirm'),
              onOK: confirmProps.opts.onOk,
            };
          } else {
            const genericErrorProps = props as GenericErrorDialogProps;
            dialogProps = {
              title: genericErrorProps.title,
              content: genericErrorProps.content,
              okBtnText: genericErrorProps.okBtnText,
              onOK: genericErrorProps.onOK,
            };
          }

          return <GenericErrorDialog key={id} {...dialogProps}></GenericErrorDialog>;
        })}
    </React.Fragment>
  );
});
export interface ConfirmDialogProps {
  title: string;
  content: string;
  opts: {
    actions: ConfirmDialogAction[] | undefined;
    btnText: Record<ConfirmDialogAction, string> | undefined;
    onOk: () => void;
    onCancel: () => void;
  };
}
export interface GenericErrorDialogProps {
  onOK: () => void;
  okBtnText: string;
  title: string;
  content: string;
}
export const GenericErrorDialog = ({
  onOK,
  title,
  content,
  okBtnText,
}: GenericErrorDialogProps) => {
  return (
    <div
      className="fcr-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRules.Level3 }}>
      <div className="fcr-mobile-dialog">
        <div className="fcr-mobile-dialog-img"></div>
        <h1>{title}</h1>
        <h2>{content}</h2>
        <div
          className="fcr-mobile-dialog-btn"
          onClick={() => {
            onOK();
          }}>
          {okBtnText}
        </div>
      </div>
    </div>
  );
};
