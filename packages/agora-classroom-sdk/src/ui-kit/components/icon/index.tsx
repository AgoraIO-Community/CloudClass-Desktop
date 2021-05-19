import React, { EventHandler, FC, ReactEventHandler, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import IconWhiteboard from '~components/icon/assets/icon-whiteboard.svg';
import './index.css';
import './style.css';

export type { IconTypes } from './icon-types';

const svgDict: string[] = [
  'recording',
  'share-screen',
  'checked',
  'close',
  'student-authorized',
  'student-whiteboard',
  'teacher-authorized',
  'teacher-whiteboard',
  'countdown'
]

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  hover?: boolean;
  iconhover?: boolean;
  useSvg?: boolean;
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
  useSvg = false,
  ...restProps
}) => {
  let cls = classnames({
    'icon-box': true,
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
    [`icon-box-hover`]: !!hover,
    ['hover']: !!hover,
    [`use-svg ${type}`]: useSvg
  });
  const iconAssets = (svgDict.includes(type) && useSvg) ? (
    <div 
      className={cls}
      style={{
        width: size,
        height: size,
        ...style
      }}
      {...restProps}
    >
    </div>
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