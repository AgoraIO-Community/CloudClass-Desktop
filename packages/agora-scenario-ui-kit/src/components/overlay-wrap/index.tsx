import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { useState, useEffect } from 'react';
import './index.css';

interface OverlayWrapProps extends BaseProps {}

export const OverlayWrap: FC<OverlayWrapProps> = ({ className, children }) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setOpened(true);
    });
    return () => {
      setOpened(false);
    };
  }, []);
  const cls = classnames({
    [`overlay-wrap`]: 1,
    [`${className}`]: !!className,
    [`opened`]: !!opened,
  });
  return <div className={cls}>{children}</div>;
};
