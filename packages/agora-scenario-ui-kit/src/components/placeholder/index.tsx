import React, { FC } from 'react';
import './index.css';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import emptyHistory from './assets/empty-history.png';
import cameraBroken from './assets/camera-broken.png';
import cameraClose from './assets/camera-close.png';
import noBody from './assets/no-body.png';
import noFile from './assets/no-file.png';
import cameraDisabled from './assets/camera-disabled.png';
import noQuestion from './assets/noquestion.svg';
import { SvgImg } from '../svg-img';
import boardDisconnected from './assets/board-disconnected.png';
import { transI18n } from '~components/i18n';
import { Button } from '~components/button';

type PlaceholderType =
  | 'emptyHistory'
  | 'cameraBroken'
  | 'cameraClose'
  | 'noBody'
  | 'noFile'
  | 'cameraDisabled'
  | 'noQuestion';

const placeholderImgDict = {
  emptyHistory,
  cameraBroken,
  cameraClose,
  noBody,
  noFile,
  cameraDisabled,
  noQuestion,
};

const svgTypeDict = {
  emptyHistory: 'placeholder-no-message',
  cameraBroken: 'placeholder-camera-broken',
  cameraClose: 'placeholder-camera-off',
  noBody: 'placeholder-no-body',
  noFile: 'placeholder-no-file',
  cameraDisabled: 'placeholder-camera-off',
  noQuestion: 'placeholder-no-ask',
};

const svgSizeDict = {
  emptyHistory: 120,
  cameraBroken: 120,
  cameraClose: 120,
  noBody: 120,
  noFile: 120,
  cameraDisabled: 120,
  noQuestion: 120,
};

export interface PlaceholderProps extends BaseProps {
  placeholderDesc?: string;
  placeholderType?: PlaceholderType;
  backgroundColor?: string;
}

export const Placeholder: FC<PlaceholderProps> = ({
  placeholderDesc = '',
  placeholderType = 'emptyHistory',
  backgroundColor = '#fff',
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps} style={{ backgroundColor }}>
      <div>
        {/* <img src={placeholderImgDict[placeholderType]} alt="no messages" /> */}
        <SvgImg
          type={svgTypeDict[placeholderType]}
          size={svgSizeDict[placeholderType]}
        />
      </div>
      {placeholderDesc ? (
        <div className="placeholder-desc">{placeholderDesc}</div>
      ) : (
        ''
      )}
    </div>
  );
};

const cameraSvgTypeDict = {
  loading: 'placeholder-no-body',
  broken: 'placeholder-camera-broken',
  muted: 'placeholder-camera-off',
  disabled: 'placeholder-camera-disabled',
};

const cameraSvgSizeDict = {
  loading: 90,
  broken: 90,
  muted: 90,
  disabled: 90,
};

export interface CameraPlaceHolderProps extends BaseProps {
  state?: 'loading' | 'broken' | 'muted' | 'disabled';
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
      {/* {children} */}
      <SvgImg type={cameraSvgTypeDict[state]} size={cameraSvgSizeDict[state]} />
    </div>
  );
};

export interface BoardPlaceHolderProps extends BaseProps {
  onReconnectClick: any;
}

export const BoardPlaceHolder: React.FC<BoardPlaceHolderProps> = ({
  onReconnectClick,
  className,
}) => {
  const cls = classnames({
    [`board-placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls}>
      <img
        src={boardDisconnected}
        alt={transI18n('whiteboard.disconnect-img-alt')}
      />
      <Button className="reconnect-btn" onClick={onReconnectClick}>
        {transI18n('whiteboard.disconnect-btn')}
      </Button>
    </div>
  );
};
