import React, { FC, useState, useEffect } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import './index.css';
import { SvgImg } from '../svg-img';
import { OverlayWrap } from '../overlay-wrap';
export interface ModalProps extends BaseProps {
  /** 标题 */
  title?: string | React.ReactNode;
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
  modalType?: 'normal' | 'back' | 'minimize';
  children?: React.ReactNode;
  btnId?: string;
  topLevel?: boolean;
  animate?: boolean;
}

type ModalType = FC<ModalProps>;

export const Modal: ModalType = ({
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
  animate = true,
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

  const [opened, setOpened] = useState(false);
  const [eventSource, setEventSource] =
    useState<{ action: 'ok' | 'cancel'; event: React.MouseEvent<HTMLElement> }>();

  useEffect(() => {
    setOpened(true);
  }, []);

  const modalJsx = (
    <div className={cls} {...restProps} style={{ ...style }}>
      <div className={['modal-title', modalType === 'back' ? 'back-modal-title' : ''].join(' ')}>
        {modalType === 'normal' ? (
          <>
            <div className="modal-title-text">{title}</div>
            {closable ? (
              <div
                className="modal-title-close"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  setEventSource({ action: 'cancel', event: e });
                  setOpened(false);
                }}>
                <SvgImg type="close" size={20} style={{ color: '#7B88A0' }} />
              </div>
            ) : (
              ''
            )}
          </>
        ) : null}
        {modalType === 'minimize' ? (
          <>
            <div className="modal-title-text">{title}</div>
            {closable ? (
              <div
                className="modal-title-close"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  setEventSource({ action: 'cancel', event: e });
                  setOpened(false);
                  onCancel && onCancel(e);
                }}>
                <SvgImg type="close-arrow" size={20} style={{ color: '#7B88A0' }} />
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
                setEventSource({ action: 'cancel', event: e });
                setOpened(false);
              }}>
              <SvgImg type="backward" style={{ color: '#7B88A0' }} />
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
                style: { width: 90 },
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  const { action } = item.props;
                  setEventSource({ action, event: e });
                  setOpened(false);
                },
              })}
            </div>
          ))}
      </div>
    </div>
  );

  const resultJsx = animate ? (
    <OverlayWrap
      opened={opened}
      onExited={() => {
        eventSource?.action === 'ok' && onOk && onOk(eventSource.event);
        eventSource?.action === 'cancel' && onCancel && onCancel(eventSource.event);
      }}>
      {modalJsx}
    </OverlayWrap>
  ) : (
    modalJsx
  );

  return hasMask ? <div className="modal-mask">{resultJsx}</div> : resultJsx;
};
