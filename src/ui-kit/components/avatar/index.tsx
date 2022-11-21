import { Avatar, AvatarProps } from 'antd';
import { FC } from 'react';
import './index.css';
type AAvatarProps = Pick<
  AvatarProps,
  'className' | 'onClick' | 'icon' | 'alt' | 'gap' | 'shape' | 'src' | 'srcSet' | 'onError'
>;

export const AAvatar: FC<AvatarProps> = ({ className = '', ...props }) => {
  return <Avatar {...props} className={`fcr-theme ${className}`} />;
};
