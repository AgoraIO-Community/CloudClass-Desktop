import React, { FC, useContext, useState, MouseEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import { getPath, getViewBox, PathOptions } from './svg-dict';
import { SvgIconEnum } from './type';
import { themeContext } from '../theme';
import './index.css';

export type SvgImgProps = BaseProps & {
  type: SvgIconEnum;
  colors?: Partial<PathOptions>;
  size?: number;
  onClick?: (e: MouseEvent) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;
};

export const SvgImg: FC<SvgImgProps> = ({
  type,
  size = 24,
  onClick,
  className,
  style,
  colors,
  onMouseDown,
  onMouseUp,
}) => {
  const cls = classnames({
    [`${className}`]: !!className,
  });
  const { iconPrimary, iconSecondary } = useContext(themeContext);

  const viewBox = getViewBox(type);
  const path = getPath(type, {
    ...colors,
    iconPrimary: colors?.iconPrimary ?? iconPrimary,
    iconSecondary: colors?.iconSecondary ?? iconSecondary,
  });

  return (
    <svg
      className={cls}
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      onClick={onClick}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      style={style}
      data-label={type}>
      {path}
    </svg>
  );
};

export type SvgIconProps = BaseProps & {
  type: SvgIconEnum;
  colors?: Partial<PathOptions>;
  hoverType: SvgIconEnum;
  hoverColors?: Partial<PathOptions>;
  size?: number;
  onClick?: any;
  canHover?: boolean;
};

// Icon that has hoverable surroundings
export const SvgIcon: FC<SvgIconProps> = ({
  type,
  hoverType,
  size,
  onClick,
  className,
  style,
  colors,
  hoverColors,
  canHover = true,
}) => {
  const [hovering, setHovering] = useState<boolean>(false);

  const t = hovering && hoverType ? hoverType : type;
  const c = hovering && hoverColors ? hoverColors : colors;

  return (
    <div
      className={canHover ? 'can-hover' : ''}
      style={{ display: 'flex' }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}>
      <SvgImg
        type={t}
        colors={c}
        size={size}
        onClick={onClick}
        className={className}
        style={style}
      />
    </div>
  );
};

export { SvgIconEnum } from './type';
