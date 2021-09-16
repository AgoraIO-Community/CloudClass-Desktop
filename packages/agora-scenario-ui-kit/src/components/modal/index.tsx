import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import Notification from 'rc-notification';
import './index.css';
import { SvgImg } from '../svg-img';
export interface ModalProps extends BaseProps {
  /** 宽度 */
  width?: string | number;
  /** 标题 */
  title?: string;
  /** 遮罩效果 */
  showMask?: boolean;
  /** 是否显示右上角的关闭按钮 */
  closable?: boolean;
  /** 底部内容 */
  footer?: React.ReactNode[];
  style?: any;
  /** 点击确定回调 */
  onOk?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调 */
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  component?: React.ReactNode;
  /**
   * 是否有蒙层
   */
  hasMask?: boolean;
  // TODO: need support
  maskClosable?: boolean;
  contentClassName?: string;
  modalType?: 'normal' | 'back';
  children?: React.ReactNode;
  btnId?: string;
  topLevel?: boolean;
}

type ModalType = FC<ModalProps> & {
  show: (params: ModalProps) => void;
};

export const Modal: ModalType = ({
  width = 280,
  title = 'modal title',
  closable = false,
  footer,
  style,
  onOk = (e: React.MouseEvent<HTMLElement>) => {
    console.log('ok');
  },
  onCancel = (e: React.MouseEvent<HTMLElement>) => {
    console.log('cancel');
  },
  children,
  className,
  component,
  contentClassName,
  modalType = 'normal',
  hasMask = true,
  maskClosable = false,
  btnId,
  topLevel = false,
  ...restProps
}) => {
  if (component) {
    return React.cloneElement(component as unknown as React.ReactElement, {
      onOk,
      onCancel,
    });
  }
  const cls = classnames({
    [`modal`]: 1,
    [`back-modal`]: modalType === 'back',
    [`${className}`]: !!className,
    // TODO: workaround solution, need redesign, control modal level
    [`top-level-modal`]: topLevel,
  });

  const contentCls = classnames({
    [`modal-content`]: contentClassName ? false : true,
    [`${contentClassName}`]: !!contentClassName,
  });

  const modalJsx = (
    <div className={cls} {...restProps} style={{ ...style, width }}>
      <div className={['modal-title', modalType === 'back' ? 'back-modal-title' : ''].join(' ')}>
        {modalType === 'normal' ? (
          <>
            <div className="modal-title-text">{title}</div>
            {closable ? (
              <div
                className="modal-title-close"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  onCancel(e);
                }}>
                <SvgImg type="close" size={20} style={{ color: '#586376' }} />
              </div>
            ) : (
              ''
            )}
          </>
        ) : null}
        {modalType === 'back' ? (
          <>
            <div
              style={{ cursor: 'pointer' }}
              className="back-icon"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                onCancel(e);
              }}>
              <SvgImg type="backward" style={{ color: '#586376' }} />
            </div>
            <div className="back-title">{title}</div>
            <div></div>
          </>
        ) : null}
      </div>
      <div className={contentCls}>{children}</div>
      <div className="modal-footer">
        {footer &&
          footer.map((item: any, index: number) => (
            <div className="btn-div" key={index} id={btnId}>
              {React.cloneElement(item, {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  const { action } = item.props;
                  action === 'ok' && onOk && onOk(e);
                  action === 'cancel' && onCancel && onCancel(e);
                },
              })}
            </div>
          ))}
      </div>
    </div>
  );

  return hasMask ? <div className="modal-mask">{modalJsx}</div> : modalJsx;
};

Modal.show = ({
  width = 280,
  title = 'modal title',
  closable = true,
  footer,
  onOk = () => {
    console.log('ok');
  },
  onCancel = () => {
    console.log('cancel');
  },
  children,
  className,
  component,
  showMask,
  maskClosable,
  ...restProps
}) => {
  const cls = classnames({
    [`rc-mask`]: !!showMask,
  });
  Notification.newInstance({ prefixCls: cls }, (notification) => {
    const modalId = 'modal-' + Date.now();
    const hideModal = () => {
      notification.removeNotice(modalId);
      notification.destroy();
    };
    const tmpOk = async (e: React.MouseEvent<HTMLElement>) => {
      await onOk(e);
      hideModal();
    };
    const tmpCancel = async (e: React.MouseEvent<HTMLElement>) => {
      await onCancel(e);
      hideModal();
    };
    const Comp = (
      <Modal
        title={title}
        width={width}
        closable={closable}
        footer={footer}
        onOk={tmpOk}
        onCancel={tmpCancel}
        children={children}
        className={className}
        component={component}
        maskClosable={maskClosable}
        {...restProps}></Modal>
    );
    notification.notice({
      content: Comp,
      duration: 0,
      key: modalId,
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    });
  });
};
