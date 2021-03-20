import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import './index.css';

export interface ChatMinProps extends BaseProps {
    unreadCount?: number;
    onClick: () => void | Promise<void>;
}

export const ChatMin: FC<ChatMinProps> = ({
    unreadCount = 0,
    onClick,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`chat-min`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps} onClick={onClick}>
            <Icon type="chat" color="#7B88A0"/>
            {unreadCount ? (<div className="unread-count"><span>{unreadCount < 10 ? unreadCount : '...'}</span></div>) : ""}
        </div>
    )
}