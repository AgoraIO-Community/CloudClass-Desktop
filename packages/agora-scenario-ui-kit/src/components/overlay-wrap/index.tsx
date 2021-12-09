import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { CSSTransition } from 'react-transition-group';
import './index.css';

interface OverlayWrapProps extends BaseProps {
  opened: boolean;
  onExited: (() => void) | undefined;
}

export const OverlayWrap: FC<OverlayWrapProps> = ({ opened, onExited, className, children }) => {
  const cls = classnames({
    [`overlay-wrap`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <CSSTransition in={opened} timeout={300} classNames={cls} unmountOnExit onExited={onExited}>
      <div className={cls}>{children}</div>
    </CSSTransition>
  );
};
