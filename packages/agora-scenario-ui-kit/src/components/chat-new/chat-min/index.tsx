import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../../../components/util/type';
import { SvgImg, SvgIconEnum } from '../../../components';
import './index.css';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';

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
      <SvgImg type={SvgIconEnum.CHAT} />
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
