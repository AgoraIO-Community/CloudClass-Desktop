import React, { EventHandler, FC, ReactEventHandler, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import IconWhiteboard from '~components/icon/assets/icon-whiteboard.svg';
import './index.css';
import './style.css';

export type { IconTypes } from './icon-types';

import recordingSvg from './assets/svg/recording.svg'
import shareScreenSvg from './assets/svg/share-screen.svg'
import checkedSvg from './assets/svg/icon-accept.svg'
import closeSvg from './assets/svg/icon-refuse.svg'

const svgDict: Record<string, any> = {
  'recording': recordingSvg,
  'share-screen': shareScreenSvg,
  'checked': checkedSvg,
  'close': closeSvg
}
export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  hover?: boolean;
  iconhover?: boolean;
  onClick?: EventHandler<SyntheticEvent<HTMLElement>>;
}

export const Icon: FC<IconProps> = ({
  type,
  className,
  style,
  size,
  color,
  hover,
  iconhover,
  ...restProps
}) => {
  const cls = classnames({
    'icon-box': true,
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
    [`icon-box-hover`]: !!hover,
    ['hover']: !!hover
  });
  const iconAssets = Object.keys(svgDict).includes(type) ? (
    <img className={cls} src={svgDict[type]} {...restProps} style={{
      width: size,
      height: size,
    }}/>
  ) : (
    <i  
      className={cls}
      style={{
        color,
        fontSize: size,
        ...style,
      }}
      {...restProps}
    >
    </i>
  )
  return (
    !!iconhover ? <div className="icon-hover">
      {iconAssets}
    </div> :
      iconAssets
  );
};

const getIconInfo = (type: string) => {
  const mapping: Record<string, string> = {
    'ppt': '#F6B081',
    'word': '#96CBE1',
    'excel': '#A6DDBF',
    'audio': '#6C82D1',
    'video': '#A8ABE9',
    'pdf': '#A3C3DE',
    'image': '#A3F2E6',
  }
  return mapping[type]
}

export type FormatIconType =
  | 'ppt'
  | 'word'
  | 'excel'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'image'

export interface IconBoxProps extends BaseProps {
  iconType: FormatIconType
}

export const IconBox: FC<IconBoxProps> = ({
  style,
  iconType,
  ...restProps
}) => {

  const color = getIconInfo(iconType)
  const type = `format-${iconType}` as IconTypes
  return (
    <Icon style={style} color={color} type={type} {...restProps}></Icon>
  )
}

export type SvgIconProps = {
  onClick?: ReactEventHandler<any>
}

export const SvgGrantBoardIcon: React.FC<SvgIconProps> = (restProps) => {
  const cls = classnames({
    [`svg-icon`]: true
  });
  return (
    <i className={cls} {...restProps} >
      <img src={IconWhiteboard} alt=""/>
    </i>
  );
}