import { EventHandler, FC, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { IconTypes } from './icon-types';
import './index.css';
import './style.css';
export type { IconTypes } from './icon-types';

export { StreamIcon } from './stream';

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  hover?: boolean;
  iconhover?: boolean;
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
  id,
  ...restProps
}) => {
  let cls = classnames({
    'icon-box': true,
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
    [`icon-box-hover`]: !!hover,
    ['hover']: !!hover,
  });
  const iconAssets = (
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
