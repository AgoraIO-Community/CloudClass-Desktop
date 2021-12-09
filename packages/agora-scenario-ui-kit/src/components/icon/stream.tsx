import { useCallback } from 'react';
import classnames from 'classnames';
import { Tooltip, TooltipPlacement } from '../tooltip';
import { SvgImg } from '../svg-img';

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
