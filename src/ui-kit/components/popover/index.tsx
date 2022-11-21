import React from 'react';
import { AbstractTooltipProps, Tooltip } from '../tooltip';
import { getRenderPropValue, RenderFunction } from '../util/getRenderPropValue';
import { getTransitionName } from '../util/motion';
import './index.css';

export interface PopoverProps extends AbstractTooltipProps {
  title?: React.ReactNode | RenderFunction;
  content?: React.ReactNode | RenderFunction;
}

export const Popover = React.forwardRef<unknown, PopoverProps>(
  ({ prefixCls: customizePrefixCls, title, content, ...otherProps }, ref) => {
    const getOverlay = (prefixCls: string) => (
      <>
        {title && <div className={`${prefixCls}-title`}>{getRenderPropValue(title)}</div>}
        <div className={`${prefixCls}-inner-content`}>{getRenderPropValue(content)}</div>
      </>
    );

    const prefixCls = customizePrefixCls ?? 'popover';
    const rootPrefixCls = 'root-popover';

    return (
      <Tooltip
        {...otherProps}
        prefixCls={prefixCls}
        ref={ref as any}
        overlay={getOverlay(prefixCls)}
        transitionName={getTransitionName(
          rootPrefixCls,
          'zoom-big-fast',
          otherProps.transitionName,
        )}
      />
    );
  },
);

Popover.defaultProps = {
  placement: 'top',
  trigger: 'hover',
  mouseEnterDelay: 0.1,
  mouseLeaveDelay: 0.1,
  overlayStyle: {},
};
