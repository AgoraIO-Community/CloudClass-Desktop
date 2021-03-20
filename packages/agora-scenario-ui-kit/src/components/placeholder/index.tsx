import React, { FC } from 'react';
import './index.css';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import emptyHistory from './assets/empty-history.png';

export interface PlaceholderProps extends BaseProps {
  placeholderDesc?: string;
}

export const Placeholder: FC<PlaceholderProps> = ({
  placeholderDesc = "",
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      <div>
        <img src={emptyHistory} alt="no messages" />
      </div>
      {placeholderDesc ? (<div className="placeholder-desc">{placeholderDesc}</div>) : ""}
    </div>
  )
};
