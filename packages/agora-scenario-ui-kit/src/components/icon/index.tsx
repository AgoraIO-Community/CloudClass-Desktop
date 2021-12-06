import React, { EventHandler, FC, ReactEventHandler, SyntheticEvent, useCallback } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { IconTypes } from './icon-types';
import IconWhiteboard from '~components/icon/assets/icon-whiteboard.svg';
import IconH5 from '~components/icon/assets/svg/icon-h5.svg';
import './index.css';
import './style.css';
import { Tooltip, TooltipPlacement } from '../tooltip';
import { SvgImg } from '../svg-img';

export type { IconTypes } from './icon-types';

const svgDict: string[] = [
  'recording',
  'share-screen',
  'checked',
  'close',
  'student-authorized',
  'student-whiteboard',
  'teacher-authorized',
  'assistant-authorized',
  'teacher-whiteboard',
  'countdown',
  'clicker',
  'whitening',
  'buffing',
  'ruddy',
  'hands-up-before',
  'hands-up-active',
  'answer',
  'vote',
];

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  hover?: boolean;
  iconhover?: boolean;
  useSvg?: boolean;
  id?: string;
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
  id,
  ...restProps
}) => {
  if (type === 'clicker') {
    useSvg = true;
  }

  let cls = classnames({
    'icon-box': true,
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
    [`icon-box-hover`]: !!hover,
    ['hover']: !!hover,
    [`use-svg ${type}`]: useSvg,
  });
  const iconAssets =
    svgDict.includes(type) && useSvg ? (
      <div
        className={cls}
        style={{
          width: size,
          height: size,
          ...style,
        }}
        {...restProps}></div>
    ) : (
      <i
        id={id}
        className={cls}
        style={{
          color,
          fontSize: size,
          ...style,
        }}
        {...restProps}></i>
    );
  return !!iconhover ? (
    <div id={id} className="icon-hover">
      {iconAssets}
    </div>
  ) : (
    iconAssets
  );
};

const getIconInfo = (type: string) => {
  const mapping: Record<string, string> = {
    ppt: '#F6B081',
    word: '#96CBE1',
    excel: '#A6DDBF',
    audio: '#6C82D1',
    video: '#A8ABE9',
    pdf: '#A3C3DE',
    image: '#A3F2E6',
  };
  return mapping[type];
};

export type FormatIconType = 'ppt' | 'word' | 'excel' | 'audio' | 'video' | 'pdf' | 'image' | 'h5';

export interface IconBoxProps extends BaseProps {
  iconType: FormatIconType;
}

export const IconBox: FC<IconBoxProps> = ({ style, iconType, ...restProps }) => {
  if (iconType === 'h5') {
    return <SvgIcon type="h5" {...restProps} />;
  }

  const color = getIconInfo(iconType);
  const type = `format-${iconType}` as IconTypes;
  return <SvgImg style={Object.assign({}, style, { color })} type={type} {...restProps} />;
};

export type SvgIconProps = {
  onClick?: ReactEventHandler<any>;
  type: 'grant-board' | 'h5';
};

const svgIconTable = {
  'grant-board': IconWhiteboard,
  h5: IconH5,
};

export const SvgIcon: React.FC<SvgIconProps> = ({ type, onClick, ...restProps }) => {
  const cls = classnames({
    [`svg-icon`]: true,
    ['resource-type']: ['h5'].includes(type),
  });

  const svgSrc = svgIconTable[type];
  return (
    <i className={cls} {...restProps}>
      <img src={svgSrc} alt="" />
    </i>
  );
};

type StreamIconProps = {
  className?: string;
  tooltip?: string;
  size?: number;
  tooltipPlacement?: TooltipPlacement;
  iconType: string;
};

export const StreamIcon = ({
  className,
  tooltip,
  tooltipPlacement,
  size = 22,
  iconType,
}: StreamIconProps) => {
  const cls = classnames({
    [`${className ? className : ''}`]: !!className,
  });

  if (tooltip) {
    const OverLayView = useCallback(() => {
      return <span>{tooltip}</span>;
    }, [tooltip]);
    return (
      <Tooltip overlay={<OverLayView />} placement={`${tooltipPlacement}` as TooltipPlacement}>
        <span>
          <SvgImg className={cls} type={iconType} size={size} canHover />
        </span>
      </Tooltip>
    );
  }

  return <SvgImg className={cls} type={iconType} size={size} />;
};
