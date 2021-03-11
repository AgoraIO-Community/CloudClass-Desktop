import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import './index.css';

export interface PopupProps extends BaseProps {
    /** 宽度 */
    width?: string | number;
    /** 标题 */
    title?: string;
    /** 是否显示右上角的关闭按钮 */
    closable?: boolean;
    /** 底部内容 */
    footer?: React.ReactNode;
}

export const Popup: FC<PopupProps> = ({
    width = 280,
    title = 'popup title',
    closable = true,
    footer,
    children,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`popup`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps} style={{width}}>
            <div className="popup-title">
                <div className="popup-title-text">
                    {title}
                </div>
                {closable ? (<div className="popup-title-close"><Icon type="close" color="#D8D8D8" /></div>) : ""}
            </div>
            <div className="popup-content">
                {children}
            </div>
            <div className="popup-footer">
                {footer}
            </div>
        </div>
    )
}
