import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import './index.css';

export interface ChatMinProps extends BaseProps {
  unreadCount?: number;
}

export const ChatMin: FC<ChatMinProps> = ({
  unreadCount = 0,
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`chat-min`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      <Icon type="chat" color="#7B88A0" />
      {unreadCount ? (
        <div className="unread-count">
          <span>{unreadCount < 100 ? unreadCount : '99+'}</span>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
