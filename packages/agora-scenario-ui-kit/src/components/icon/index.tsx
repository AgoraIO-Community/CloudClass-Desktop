import { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { IconTypes } from './icon-types';
import './svg-style.css';
export type { IconTypes } from './icon-types';
export { StreamIcon } from './stream';

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  onClick?: () => void;
}

export const Icon: FC<IconProps> = ({ type, className, style, size, color, ...restProps }) => {
  let cls = classnames(`icon-${type}`, {
    [`${className}`]: !!className,
  });
  const iconAssets = (
    <i
      className={cls}
      style={{
        color,
        fontSize: size,
        ...style,
      }}
      {...restProps}></i>
  );

  return iconAssets;
};
