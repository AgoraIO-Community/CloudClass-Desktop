import React, { EventHandler, FC, ReactEventHandler, SyntheticEvent, useCallback } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IconTypes } from './icon-types';
import IconWhiteboard from '~components/icon/assets/icon-whiteboard.svg';
import IconH5 from '~components/icon/assets/svg/icon-h5.svg';
import './index.css';
import './style.css';
import { Tooltip, TooltipPlacement } from '../tooltip';
import { transI18n } from '../i18n';
import { EduLogger } from 'agora-rte-sdk';

export type { IconTypes } from './icon-types';

const svgDict: string[] = [
  'recording',
  'share-screen',
  'checked',
  'close',
  'more-info',
  'preview',
  'student-authorized',
  'student-whiteboard',
  'teacher-authorized',
  'assistant-authorized',
  'teacher-whiteboard',
  'countdown',
  'clicker',
  'answer',
  'vote'
]

export interface IconProps extends BaseProps {
  type: IconTypes;
  size?: number;
  color?: string;
  hover?: boolean;
  iconhover?: boolean;
  useSvg?: boolean;
  id?: string;
  onClick?: EventHandler<SyntheticEvent<HTMLElement>>;
}

export const Icon: FC<IconProps> = ({
  type,
  className,
  style,
  size,
  color,
  hover,
  iconhover,
  useSvg = false,
  id,
  ...restProps
}) => {

  if (type === 'clicker' || type === 'more-info' || type === 'preview') {
    useSvg = true
  }

  let cls = classnames({
    'icon-box': true,
    [`iconfont icon-${type}`]: true,
    [`${className}`]: !!className,
    [`icon-box-hover`]: !!hover,
    ['hover']: !!hover,
    [`use-svg ${type}`]: useSvg
  });
  const iconAssets = (svgDict.includes(type) && useSvg) ? (
    <div 
      className={cls}
      style={{
        width: size,
        height: size,
        ...style
      }}
      {...restProps}
    >
    </div>
  ) : (
    <i  
      id={id}
      className={cls}
      style={{
        color,
        fontSize: size,
        ...style,
      }}
      {...restProps}
    >
    </i>
  )
  return (
    !!iconhover ? <div id={id} className="icon-hover">
      {iconAssets}
    </div> :
      iconAssets
  );
};

const getIconInfo = (type: string) => {
  const mapping: Record<string, string> = {
    'ppt': '#F6B081',
    'word': '#96CBE1',
    'excel': '#A6DDBF',
    'audio': '#6C82D1',
    'video': '#A8ABE9',
    'pdf': '#A3C3DE',
    'image': '#A3F2E6',
  }
  return mapping[type]
}

export type FormatIconType =
  | 'ppt'
  | 'word'
  | 'excel'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'image'
  | 'h5'

export interface IconBoxProps extends BaseProps {
  iconType: FormatIconType
}

export const IconBox: FC<IconBoxProps> = ({
  style,
  iconType,
  ...restProps
}) => {

  if (iconType === 'h5') {
    return <SvgIcon type="h5" {...restProps} />
  }

  const color = getIconInfo(iconType)
  const type = `format-${iconType}` as IconTypes
  return (
    <Icon style={style} color={color} type={type} {...restProps}></Icon>
  )
}

export type SvgIconProps = {
  onClick?: ReactEventHandler<any>
  type: 'grant-board' | 'h5'
}

const svgIconTable = {
  'grant-board': IconWhiteboard,
  'h5': IconH5
}

export const SvgIcon: React.FC<SvgIconProps> = ({type, onClick, ...restProps}) => {
  const cls = classnames({
    [`svg-icon`]: true,
    ['resource-type']: ['h5'].includes(type),
  });

  const svgSrc = svgIconTable[type]
  return (
    <i className={cls} {...restProps} >
      <img src={svgSrc} alt=""/>
    </i>
  );
}

type MediaIconState = {
  hover: boolean,
  state: any,
  streamState: boolean,
  type: any
}

type MediaIconArgs = {
  muted: boolean;
  deviceState: any;
  online: boolean;
  onPodium?: boolean;
  userType: string;
  hasStream: boolean;
  isLocal: boolean;
  type: any;
  uid: any;
  disabled?: boolean;
  // canOperate: boolean;
}

export const getMediaIconProps = (args: MediaIconArgs): MediaIconState => {
  const {
    muted,
    deviceState,
    online,
    onPodium,
    userType,
    hasStream,
    isLocal,
    type,
    uid,
    disabled = false,
  } = args

  const canHover = disabled === true ? false : true

  if (!isLocal) {
    if (userType === 'student') {
      if (!online || !onPodium) {
        return {
          hover: false,
          state: 'not-available',
          streamState: false,
          type: type
        }
      } else {
        if (deviceState !== 1) {
          return {
            hover: false,
            state: 'not-available',
            streamState: false,
            type: type
          }
        } else {
          if (!muted) {
            return {
              hover: false,
              state: 'not-available',
              streamState: false,
              type: type
            }
          } else {
            return {
              hover: false,
              state: 'not-permitted',
              streamState: false,
              type
            }
          }
        }
      }
    }
    if (userType === 'teacher' || userType === 'assistant') {
      if (!online || !onPodium || deviceState === 2 || !hasStream) {
        return {
          hover: false,
          state: 'not-available',
          streamState: false,
          type: type
        }
      }
      if (hasStream && muted === false) {
        return {
          hover: canHover,
          state: 'available',
          streamState: false,
          type: type
        }
      }
      if (deviceState === 0 || deviceState === 2) {
        return {
          hover: false,
          state: 'not-available',
          streamState: false,
          type: type
        }
      }
      return {
        hover: canHover,
        state: 'available',
        streamState: muted,
        type: type
      }
    }
    return {
      hover: canHover,
      state: 'available',
      streamState: muted,
      type: type
    }
  } else {
    if (deviceState === 2 || !hasStream || !onPodium || !online) {
      return {
        hover: false,
        state: 'not-available',
        streamState: false,
        type: type
      }
    }
    if (muted === false) {
      return {
        hover: canHover,
        state: 'available',
        streamState: false,
        type: type
      }
    }

    if (deviceState === 1) {
      return {
        hover: canHover,
        state: 'available',
        streamState: muted,
        type: type
      }
    } else {
      return {
        hover: false,
        state: 'not-available',
        streamState: muted,
        type: type
      }
    }
  }
}

type MediaIconProps = {
  className?: string;
  type: 'microphone' | 'camera';
  hover: boolean;
  streamState?: boolean;
  volumeIndicator?: boolean;
  placement?: string;
  state: 'available' | 'not-available' | 'not-permitted'
  onClick: (evt: any) => any
}

export const MediaIcon = ({className, hover, state, streamState = false, volumeIndicator = false, placement = '', type, onClick}: MediaIconProps) => {
  const cls = classnames({
    [`rtc-state-${state}`]: 1,
    [`${className ? className : ''}`]: !!className
  })

  const mapType: Record<string, any> = {
    'not-available': {
      'microphone': 'microphone-off-outline',
      'camera': 'camera-off',
    },
    'available': {
      'microphone': !!streamState === true ? 'microphone-on-outline' : 'microphone-off-outline',
      'camera': !!streamState === true ? 'camera' : 'camera-off',
    },
    'not-permitted': {
      'microphone': 'microphone-on-outline',
      'camera': 'camera',
    }
  }

  if (volumeIndicator && type === 'microphone') {
    const volumeMapType: Record<string, any> = {
      'not-available': {
        'microphone': 'microphone-off',
      },
      'available': {
        'microphone': !!streamState === true ? 'microphone-on' : 'microphone-off',
      },
      'not-permitted': {
        'microphone': 'microphone-on',
      }
    }
    return (
      <Icon
        hover={false}
        className={cls}
        type={volumeMapType[state][type]}
      />
    )
  }

  if (placement) {
    const text: Record<string, any> = {
      'camera': {
        // 'true': 'Close Camera',
        // 'false': 'Open Camera',
        'not-available': 'Camera Not Available',
        'not-permitted': 'Camera Not Available',
        'available': streamState === true ? 'Close Camera' : 'Open Camera',
      },
      'microphone': {
        // 'true': 'Close Microphone',
        // 'false': 'Open Microphone',
        'not-available': 'Microphone Not Available',
        'not-permitted': 'Microphone Not Available',
        'available': streamState === true ? 'Close Microphone' : 'Open Microphone',
      }
    }
    const title = transI18n(text[type][`${state}`])

    const OverLayView = useCallback(() => {
      return <span>{title}</span>
    }, [title])
    return (
      <Tooltip overlay={<OverLayView />} placement={`${placement}` as TooltipPlacement}>
        <Icon
          key={title}
          hover={hover}
          className={cls}
          type={mapType[state][type]}
          onClick={onClick}
        />
      </Tooltip>
    )
  }
  
  return (
    <Icon
      hover={hover}
      className={cls}
      type={mapType[state][type]}
      onClick={onClick}
    />
  )
}