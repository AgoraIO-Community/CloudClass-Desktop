import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import Notification from 'rc-notification'
import './index.css';

export interface ModalProps extends BaseProps {
    /** 宽度 */
    width?: string | number;
    /** 标题 */
    title?: string;
    /** 是否显示右上角的关闭按钮 */
    closable?: boolean;
    /** 底部内容 */
    footer?: React.ReactNode;
    /** 点击确定回调 */
    onOk?: (e: React.MouseEvent<HTMLElement>) => void;
    /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调 */
    onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const Modal: FC<ModalProps> = ({
    width = 280,
    title = 'modal title',
    closable = true,
    footer,
    onOk = () => { console.log('ok') },
    onCancel = () => { console.log('cancel') },
    children,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`modal`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps} style={{ width }}>
            <div className="modal-title">
                <div className="modal-title-text">
                    {title}
                </div>
                {closable ? (<div className="modal-title-close" onClick={() => {onCancel()}}><Icon type="close" color="#D8D8D8" /></div>) : ""}
            </div>
            <div className="modal-content">
                {children}
            </div>
            <div className="modal-footer">
                {footer.map((item, index) => (
                    <div className="btn-div" key={index}>
                        {
                            React.cloneElement(item, {
                                onClick: e => {
                                    const { action } = item.props;
                                    action === 'ok' && onOk(e);
                                    action === 'cancel' && onCancel(e);
                                }
                            })
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

Modal.show = function (
    {
        width = 280,
        title = 'modal title',
        closable = true,
        footer,
        onOk = () => { console.log('ok') },
        onCancel = () => { console.log('cancel') },
        children,
        className,
        ...restProps
    }
) {
    Notification.newInstance({}, notification => {
        const modalId = 'modal-' + Date.now()
        const hideModal = () => {
            notification.removeNotice(modalId)
            notification.destroy()
        }
        const tmpOk = async () => {
            await onOk()
            hideModal()
        }
        const tmpCancel = async () => {
            await onCancel()
            hideModal()
        }
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
                {...restProps}
            ></Modal>
        )
        notification.notice({
            content: Comp,
            duration: 0,
            key: modalId,
            style: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }
        });
    });
}
