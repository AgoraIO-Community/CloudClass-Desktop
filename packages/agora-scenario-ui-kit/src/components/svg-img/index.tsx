import { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { getPath, getViewBox } from './svg-dict';
import './index.css';

export type SvgImgProps = BaseProps & {
  type: string;
  color?: string;
  size?: number;
  canHover?: boolean;
  onClick?: any;
};

export const SvgImg: FC<SvgImgProps> = ({
  type,
  size = 25,
  canHover = false,
  onClick,
  className,
  style,
  color,
}) => {
  const cls = classnames('svg-img', `icon-${type}`, {
    'can-hover': canHover,
    [`${className}`]: !!className,
  });
  return (
    <svg
      className={cls}
      width={size}
      height={size}
      viewBox={getViewBox(type)}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      onClick={onClick}
      style={style}>
      {getPath(type, { className: type, color })}
    </svg>
  );
};

export type SvgIconProps = BaseProps & {
  type: string;
  hoverType?: string;
  color?: string;
  size?: number;
  canHover?: boolean;
  onClick?: any;
};

export const SvgIcon: FC<SvgIconProps> = ({
  type,
  hoverType,
  size = 25,
  canHover = false,
  onClick,
  className,
  style,
  color,
}) => {
  const [hovering, setHovering] = useState<boolean>(false);
  const t = hovering && hoverType ? hoverType : type;
  const cls = classnames('svg-img', `icon-${t}`, {
    'can-hover': canHover,
    [`${className}`]: !!className,
  });
  return (
    <div
      style={{ display: 'flex' }}
      onMouseEnter={() => canHover && setHovering(true)}
      onMouseLeave={() => canHover && setHovering(false)}>
      <svg
        className={cls}
        width={size}
        height={size}
        viewBox={getViewBox(t)}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        onClick={onClick}
        style={style}>
        {getPath(t, { className: t, color })}
      </svg>
    </div>
  );
};
