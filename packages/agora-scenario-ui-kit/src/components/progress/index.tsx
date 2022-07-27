import classnames from 'classnames';
import React from 'react';
import { BaseProps } from '~ui-kit/components/util/type';
import './index.css';

export type ProgressType = 'download';

export interface ProgressProps extends BaseProps {
  progress: number;
  width: number;
  type: ProgressType;
}

export const Progress: React.FC<ProgressProps> = ({
  progress,
  width,
  children,
  className,
  style,
  type,
  ...restProps
}) => {
  const cls = classnames({
    [`${className}`]: !!className,
  });

  const bgCls = classnames({
    [`overflow-hidden h-2 text-xs flex rounded bg-${type}-bg`]: 1,
    ['progress-height']: 1,
  });

  const fgCls = classnames({
    [`bg-${type}-fg`]: 1,
  });

  const progressWidth = progress;

  return (
    <div
      className={cls}
      style={{
        width: width,
        ...style,
      }}
      {...restProps}>
      <div className={bgCls}>
        <div className={fgCls} style={{ width: `${progressWidth}%` }}></div>
      </div>
    </div>
  );
};
