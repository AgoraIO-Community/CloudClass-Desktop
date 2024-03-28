import classNames from 'classnames';
import { FC, ReactNode } from 'react';
// import { Button, ButtonProps } from '../button';
import { Button, ButtonProps } from '@classroom/ui-kit';
import './confirm-dialog.css';
import { toJS } from 'mobx';
import { useStore } from '@classroom/hooks/ui-store';
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

  /**
   * 对话框位置
   */
  /** @en
   *  Dialog position.
   */
  position?: ReactNode;
  /**
   * 按钮风格
   */
  /**
   * Button style
   */
  buttonStyle?: ReactNode;
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
    position,
    buttonStyle,
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
  const {
    shareUIStore: { isLandscape },
  } = useStore();
  const cls = classNames('fcr-dialog-wrap', {
    'fcr-dialog-wrap-middle': position === 'middle',
    'fcr-dialog-wrap-landscape': isLandscape,
  });
  // const footerCls = classNames('fcr-confirm-dialog-footer', {
  //   'fcr-confirm-dialog-footer-block': buttonStyle === 'block',
  // });
  const btnMobileCls = classNames(
    { 'fcr-btn-mobile': buttonStyle !== 'block' },
    { 'fcr-btn-mobile-block': buttonStyle === 'block' },
  );
  const cancelBtnMobileCls = classNames(
    { 'fcr-btn-mobile fcr-btn-mobile-cancel': buttonStyle !== 'block' },
    { 'fcr-btn-mobile-block fcr-btn-mobile-cancel-block': buttonStyle === 'block' },
  );
  const footBtnsCls = classNames(
    { 'fcr-confirm-dialog-footer-btns': buttonStyle !== 'block' },
    {
      'fcr-confirm-dialog-footer-block': buttonStyle === 'block',
    },
  );
  return (
    <div
      className="fcr-dialog-mask"
      // classNames="fcr-confirm-dialog"
    >
      <div className={cls}>
        <div className="fcr-confirm-dialog-inner-wrap">
          {icon && <div className="fcr-confirm-dialog-inner-icon">{toJS(icon)}</div>}
          <div></div>
          <div>
            <div className={classNames('fcr-confirm-dialog-title')}>{title}</div>
            <div className={classNames('fcr-confirm-dialog-inner')}>{content || children}</div>
          </div>
        </div>

        <div className={'fcr-confirm-dialog-footer'}>
          {footer || (
            <div className={footBtnsCls}>
              {cancelButtonVisible && (
                <Button
                  onClick={() => {
                    onCancel?.();
                  }}
                  size="lg"
                  {...cancelButtonProps}
                  className={cancelBtnMobileCls}>
                  {cancelText || 'Cancel'}
                </Button>
              )}

              {okButtonVisible && (
                <Button onClick={onOk} size="lg" {...okButtonProps} className={btnMobileCls}>
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
