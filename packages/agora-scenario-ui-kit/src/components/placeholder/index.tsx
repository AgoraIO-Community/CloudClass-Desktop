import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps, IconWithState } from '~ui-kit/components/util/type';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { Z_INDEX_RULES } from '~utilities/style-config';
import './index.css';
import { InteractionStateColors, PlaceholderStateColors } from '~ui-kit/utilities/state-color';

type PlaceholderType =
  | 'emptyHistory'
  | 'cameraBroken'
  | 'cameraClose'
  | 'noBody'
  | 'noFile'
  | 'cameraDisabled'
  | 'noQuestion';

const svgTypeDict: Record<string, IconWithState> = {
  emptyHistory: { icon: SvgIconEnum.PLACEHOLDER_NO_MESSAGE },
  cameraBroken: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_BROKEN },
  cameraClose: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_OFF },
  noBody: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_NO_BODY },
  noFile: { icon: SvgIconEnum.PLACEHOLDER_NO_FILE },
  cameraDisabled: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_OFF },
  noQuestion: { icon: SvgIconEnum.PLACEHOLDER_NO_ASK },
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
        <SvgImg type={svgTypeDict[placeholderType].icon} size={svgSizeDict[placeholderType]} />
      </div>
      {placeholderDesc ? <div className="placeholder-desc">{placeholderDesc}</div> : ''}
    </div>
  );
};

const cameraSvgTypeDict: Record<string, IconWithState> = {
  loading: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_NO_BODY, color: PlaceholderStateColors.disabled },
  broken: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_BROKEN, color: PlaceholderStateColors.normal },
  muted: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_OFF, color: PlaceholderStateColors.normal },
  disabled: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_OFF, color: PlaceholderStateColors.disabled },
  none: { icon: SvgIconEnum.PLACEHOLDER_CAMERA_NO_BODY, color: PlaceholderStateColors.disabled },
  notpresent: { icon: SvgIconEnum.PLACEHOLDER_NOT_PRESENT, color: PlaceholderStateColors.normal },
  nosetup: { icon: SvgIconEnum.PLACEHOLDER_NO_SETUP, color: PlaceholderStateColors.normal },
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
        type={cameraSvgTypeDict[state].icon}
        size={placeholderSize ? placeholderSize : cameraSvgSizeDict[state]}
        colors={{ iconPrimary: cameraSvgTypeDict[state].color }}
      />
      <span>{text}</span>
    </div>
  );
};
