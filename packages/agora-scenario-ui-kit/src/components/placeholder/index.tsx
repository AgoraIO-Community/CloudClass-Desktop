import React, { FC } from 'react';
import './index.css';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { SvgImg } from '../svg-img';
import boardDisconnected from './assets/board-disconnected.png';
import { transI18n } from '~components/i18n';
import { Button } from '~components/button';
import { Z_INDEX_RULES } from '~utilities/style-config';

type PlaceholderType =
  | 'emptyHistory'
  | 'cameraBroken'
  | 'cameraClose'
  | 'noBody'
  | 'noFile'
  | 'cameraDisabled'
  | 'noQuestion';

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
        <SvgImg type={svgTypeDict[placeholderType]} size={svgSizeDict[placeholderType]} />
      </div>
      {placeholderDesc ? <div className="placeholder-desc">{placeholderDesc}</div> : ''}
    </div>
  );
};

const cameraSvgTypeDict = {
  loading: 'placeholder-no-body',
  broken: 'placeholder-camera-broken',
  muted: 'placeholder-camera-off',
  disabled: 'placeholder-camera-disabled',
  none: 'placeholder-no-body',
  notpresent: 'placeholder-not-present',
  nosetup: 'placeholder-no-setup',
};

const cameraSvgSizeDict = {
  loading: 90,
  broken: 90,
  muted: 90,
  disabled: 90,
  none: 90,
  notpresent: 80,
  nosetup: 90,
};

const cameraSvgZIndex = {
  loading: Z_INDEX_RULES.zIndexCameraPlaceholderLoading,
  broken: Z_INDEX_RULES.zIndexCameraPlaceholderBroken,
  muted: Z_INDEX_RULES.zIndexCameraPlaceholderMuted,
  disabled: Z_INDEX_RULES.zIndexCameraPlaceholderDisabled,
  none: Z_INDEX_RULES.zIndexCameraPlaceholderNone,
};

export interface CameraPlaceHolderProps extends BaseProps {
  state?: 'loading' | 'broken' | 'muted' | 'disabled' | 'none' | 'notpresent' | 'nosetup';
  text?: string;
  placeholderSize?: number;
  children?: React.ReactNode;
}

export const CameraPlaceHolder: React.FC<CameraPlaceHolderProps> = ({
  state = 'loading',
  text,
  placeholderSize = 0,
  className,
  style,
}) => {
  const cls = classnames({
    [`camera-placeholder`]: 1,
    [`camera-${state}-placeholder`]: !!state,
    [`${className}`]: !!className,
  });

  return (
    <div
      className={cls}
      style={{
        zIndex: cameraSvgZIndex[state],
        ...style,
      }}>
      <SvgImg
        type={cameraSvgTypeDict[state]}
        size={placeholderSize ? placeholderSize : cameraSvgSizeDict[state]}
      />
      <span>{text}</span>
    </div>
  );
};

export interface BoardPlaceHolderProps extends BaseProps {
  onReconnectClick: any;
}

export const BoardPlaceHolder: React.FC<BoardPlaceHolderProps> = ({
  onReconnectClick,
  className,
  style,
}) => {
  const cls = classnames({
    [`board-placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} style={{ ...style }}>
      <img src={boardDisconnected} alt={transI18n('whiteboard.disconnect-img-alt')} />
      <Button className="reconnect-btn" onClick={onReconnectClick}>
        {transI18n('whiteboard.disconnect-btn')}
      </Button>
    </div>
  );
};
