import React, { FC, useEffect, useRef, useState } from 'react';
import {
  createPopper,
  Placement as PopperPlacement,
  Instance as PopperInstance,
} from '@popperjs/core';

import './index.css';

export type Placement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

const PLACEMENTS: { [key: string]: PopperPlacement } = {
  topLeft: 'top-start',
  topRight: 'top-end',
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
  leftTop: 'left-start',
  leftBottom: 'left-end',
  rightTop: 'right-start',
  rightBottom: 'right-end',
};

export interface PopperProps {
  anchorEl: HTMLElement | null;
  visible?: boolean;
  placement?: Placement;
}

export const Popper: FC<PopperProps> = ({
  anchorEl,
  visible,
  placement = 'right',
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [popper, setPopper] = useState<PopperInstance | null>(null);

  useEffect(() => {
    if (!popper && ref.current && anchorEl && visible) {
      const instance = createPopper(anchorEl, ref.current, {
        placement: (PLACEMENTS[placement] ?? placement) as PopperPlacement,
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 10] },
          },
        ],
      });
      setPopper(instance);
      return;
    }
    if (popper && !visible) {
      popper.destroy();
      setPopper(null);
    }
  }, [anchorEl, ref, visible, placement]);
  return (
    <>
      {visible ? (
        <div ref={ref} className="popper" role="popper">
          <div>{children}</div>
          <div className="arrow" data-popper-arrow></div>
        </div>
      ) : null}
    </>
  );
};
