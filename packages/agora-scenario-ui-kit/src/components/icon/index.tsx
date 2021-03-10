import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import './index.css';

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
}
export const Icon: FC<IconProps> = ({
  type,
  className,
  style,
  size = 24,
  color = '#333',
  ...restProps
}) => {
  const cls = classnames({
    [`iconfont icon-${type}`]: true,
  });
  return (
    <i
      className={cls}
      style={{
        color,
        fontSize: size,
        ...style,
      }}
      {...restProps}></i>
  );
};

const getIconColor = (type: string) => {
  const mapping: Record<string, string> = {
    'format-ppt': '#F6B081',
    'format-docx': '#96CBE1',
    'format-doc': '#A6DDBF',
    'format-mp3': '#6C82D1',
    'format-mp4': '#A8ABE9',
    'format-pdf': '#A3C3DE',

  }
  return mapping[type]
}

export interface IconBoxProps extends BaseProps {
  iconType: IconTypes
}

export const IconBox: FC<IconBoxProps> = ({
  style,
  iconType,
  ...restProps
}) => {

  const color = getIconColor(iconType)
  return (
    <Icon style={style} color={color} type={iconType} {...restProps}></Icon>
  )
}