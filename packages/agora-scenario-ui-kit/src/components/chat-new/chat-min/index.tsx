import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../../../components/interface/base-props';
import { Icon, SvgImg } from '../../../components';
import './index.css';

export interface ChatMinProps extends BaseProps {
  unreadCount?: number;
  onClick?: () => void | Promise<void>;
}

export const ChatMin: FC<ChatMinProps> = ({
  unreadCount = 0,
  className,
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`chat-min`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} onClick={() => onClick && onClick()} {...restProps}>
      <SvgImg
        type="chat"
        style={{
          color: '#7B88A0',
        }}
      />
      {unreadCount ? (
        <div className="unread-count">
          {/* <span>{unreadCount < 100 ? unreadCount : '99+'}</span> */}
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
