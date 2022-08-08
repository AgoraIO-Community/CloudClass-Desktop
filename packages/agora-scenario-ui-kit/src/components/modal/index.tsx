import React, { FC, useState, useEffect, useContext } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/util/type';
import './index.css';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { OverlayWrap } from '../overlay-wrap';
import { themeContext } from '~ui-kit';
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
  const { textLevel1 } = useContext(themeContext);

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

  useEffect(() => {
    setOpened(true);
  }, []);
  const triggerModalAction = (eventSource: {
    action: 'ok' | 'cancel';
    event: React.MouseEvent<HTMLElement>;
  }) => {
    switch (eventSource.action) {
      case 'ok':
        onOk && onOk(eventSource.event);
        break;
      case 'cancel':
        onCancel && onCancel(eventSource.event);
        break;
    }
  };
  const modalJsx = (
    <div className={cls} {...restProps} style={{ ...style }}>
      <div className={['modal-title', modalType === 'back' ? 'back-modal-title' : ''].join(' ')}>
        {modalType === 'normal' ? (
          <>
            <div className="modal-title-text">{title}</div>
            {closable ? (
              <div
                className="modal-title-action modal-title-close"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  triggerModalAction({ action: 'cancel', event: e });
                  setOpened(false);
                }}>
                <SvgImg type={SvgIconEnum.CLOSE} size={20} colors={{ iconPrimary: textLevel1 }} />
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
                className="modal-title-action modal-title-close"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  triggerModalAction({ action: 'cancel', event: e });
                  setOpened(false);
                }}>
                <SvgImg
                  type={SvgIconEnum.TRIANGLE_SOLID_DOWN}
                  size={20}
                  colors={{ iconPrimary: textLevel1 }}
                />
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
                triggerModalAction({ action: 'cancel', event: e });
                setOpened(false);
              }}>
              <SvgImg type={SvgIconEnum.BACKWARD} colors={{ iconPrimary: textLevel1 }} />
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
                  const { action, className } = item.props;
                  triggerModalAction({ action, event: e });
                  !className?.includes('disableAGModalClose') && setOpened(false);
                },
              })}
            </div>
          ))}
      </div>
    </div>
  );

  const resultJsx = animate ? <OverlayWrap opened={opened}>{modalJsx}</OverlayWrap> : modalJsx;

  return hasMask ? <div className="modal-mask">{resultJsx}</div> : resultJsx;
};
