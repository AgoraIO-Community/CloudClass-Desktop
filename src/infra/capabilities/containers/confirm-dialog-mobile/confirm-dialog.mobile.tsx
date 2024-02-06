import classNames from 'classnames';
import { FC, ReactNode } from 'react';
// import { Button, ButtonProps } from '../button';
import { Button, ButtonProps } from '@classroom/ui-kit';
import './confirm-dialog.mobile.css';
import { toJS } from 'mobx';
export interface ConfirmDialogProps {
  /**
   * 对话框标题
   */
  /** @en
   * The dialog's title.
   */
  title?: ReactNode;
  /**
   * 对话框底部元素
   */
  /** @en
   * Footer content
   */
  footer?: ReactNode;
  /**
   * 点击对话框确认按钮回调
   */
  /** @en
   * Specify a function that will be called when a user clicks the OK button
   */
  onOk?: () => void;

  /**
   * 是否展示对话框checkbox
   */
  /** @en
   * Wheter the chekcbox is visibleon bottom left of the dialog or not.
   */
  checkable?: boolean;
  /**
   * 对话框checkbox属性
   */
  /** @en
   * The checkbox props.
   */
  // checkedProps?: CheckboxProps;
  /**
   * 对话框确认按钮文案
   */
  /** @en
   * Text of the OK button
   */
  okText?: ReactNode;
  /**
   * 对话框取消按钮文案
   */
  /** @en
   * Text of the cancel button
   */
  cancelText?: ReactNode;
  /**
   * 对话框图标
   */
  /** @en
   * Set the icon on the left of the dialog title and content.
   */
  icon?: ReactNode;
  content?: ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  okButtonVisible?: boolean;
  cancelButtonVisible?: boolean;
  onCancel?: () => void;
}
export const ConfirmDialog: FC<React.PropsWithChildren<ConfirmDialogProps>> = (props) => {
  const {
    onCancel,
    // visible,
    content,
    children,
    title,
    footer,
    onOk,
    // width,
    icon,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    okButtonVisible = true,
    cancelButtonVisible = true,
    // getContainer,
  } = props;
  return (
    <div
      className="fcr-dialog-mask"
    // classNames="fcr-confirm-dialog"
    >
      <div className='fcr-dialog-wrap'>

        <div className="fcr-confirm-dialog-inner-wrap">
          {icon && <div className="fcr-confirm-dialog-inner-icon">{toJS(icon)}</div>}
          <div></div>
          <div>
            <div className={classNames('fcr-confirm-dialog-title')}>{title}</div>
            <div className={classNames('fcr-confirm-dialog-inner')}>{content || children}</div>
          </div>
        </div>

        <div className={classNames('fcr-confirm-dialog-footer')}>
          {footer || (
            <div className={classNames('fcr-confirm-dialog-footer-btns')}>
              {cancelButtonVisible && (
                <Button
                  onClick={() => {
                    onCancel?.();
                  }}
                  size="sm"
                  {...cancelButtonProps}
                  className='fcr-btn-mobile fcr-btn-mobile-cancel '
                >
                  {cancelText || 'Cancel'}
                </Button>
              )}

              {okButtonVisible && (
                <Button onClick={onOk} size="sm" {...okButtonProps} className='fcr-btn-mobile'>
                  {okText || 'OK'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
