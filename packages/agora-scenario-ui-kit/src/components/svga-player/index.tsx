import classnames from 'classnames';
import React, { FC } from 'react';
import { BaseProps } from '~components/interface/base-props';
import { useAudioPlayer, useTimeout } from '~utilities/hooks';
import rewardAudio from './assets/audio/reward.mp3';
import StarAnimation from './assets/star.gif';
import './index.css';
import { SvgaTypes } from './svga-types';
export type { SvgaTypes } from './svga-types';

export interface SvgaPlayerProps extends BaseProps {
    type: SvgaTypes;
    width?: number;
    height?: number;
    audio?: string;
    duration?: number;
    onStart?: () => void | Promise<void>;
    onEnd?: () => void | Promise<void>;
    onClose?: () => void;
}

export const SvgaPlayer: FC<SvgaPlayerProps> = ({
    type,
    width,
    height,
    audio = '',
    onStart = () => {console.log('start')},
    onEnd = () => {console.log('end')},
    className,
    duration = 300,
    onClose = console.log('onClose'),
    ...restProps
}) => {

    useAudioPlayer(rewardAudio)

    useTimeout(() => {
        onClose && onClose()
    }, duration)

    const cls = classnames({
        [`svga-player`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps} style={{width: width ? width : 'auto', height: height ? height : 'auto'}}>
            <img src={StarAnimation} alt="" style={{width: width ? width : 'auto', height: height ? height : 'auto'}}/>
        </div>
    )
}