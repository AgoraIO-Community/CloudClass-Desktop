import React, { FC } from 'react';
import './index.css';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import emptyHistory from './assets/empty-history.png';
import cameraBroken from './assets/camera-broken.png';
import cameraClose from './assets/camera-close.png';
import noBody from './assets/no-body.png';
import noFile from './assets/no-file.png';

type PlaceholderType = 'emptyHistory' | 'cameraBroken' | 'cameraClose' | 'noBody' | 'noFile'

const placeholderImgDict = {
  emptyHistory,
  cameraBroken,
  cameraClose,
  noBody,
  noFile
}

export interface PlaceholderProps extends BaseProps {
  placeholderDesc?: string;
  placeholderType?: PlaceholderType;
  backgroundColor?: string;
}

export const Placeholder: FC<PlaceholderProps> = ({
  placeholderDesc = "",
  placeholderType = "emptyHistory",
  backgroundColor = '#fff',
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps} style={{backgroundColor}}>
      <div>
        <img src={placeholderImgDict[placeholderType]} alt="no messages" />
      </div>
      {placeholderDesc ? (<div className="placeholder-desc">{placeholderDesc}</div>) : ""}
    </div>
  )
};

export interface CameraPlaceHolderProps extends BaseProps {
  state?: 'loading' | 'broken' | 'muted',
  children?: React.ReactNode;
}

export const CameraPlaceHolder: React.FC<CameraPlaceHolderProps> = ({
  children,
  state = 'loading',
  className,
}) => {
  const cls = classnames({
    [`camera-placeholder`]: 1,
    [`camera-${state}-placeholder`]: !!state,
    [`${className}`]: !!className,
  });

  return (
    <div className={cls}>
      {children}
    </div>
  )
}