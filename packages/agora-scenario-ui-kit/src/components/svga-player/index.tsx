import React, { FC, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

import { Downloader, Parser, Player } from 'svga.lite'

import rewardSvga from './assets/svga/reward.svga'
import handsUpSvags from './assets/svga/hands-up.svga'

import rewardAudio from './assets/audio/reward.mp3'

import { SvgaTypes } from './svga-types'

export type { SvgaTypes } from './svga-types';

export interface SvgaPlayerProps extends BaseProps {
    type: SvgaTypes;
    width?: number;
    height?: number;
    audio?: string;
    onStart?: () => void | Promise<void>
    onEnd?: () => void | Promise<void>
}

const svgaDict = {
    'reward': rewardSvga,
    'hands-up': handsUpSvags
}

const audioDict = {
    'reward': rewardAudio
}

export const SvgaPlayer: FC<SvgaPlayerProps> = ({
    type,
    width,
    height,
    audio = '',
    onStart = () => {console.log('start')},
    onEnd = () => {console.log('end')},
    className,
    ...restProps
}) => {
    const el = useRef(null)
    const onStart_ = onStart;
    if (audio) {
        onStart = () => {
            const ad = new Audio()
            // @ts-ignore
            ad.src = audioDict[audio] 
            ad.play()
            onStart_()
        }
    }
    useEffect(() => {
        const downloader = new Downloader()
        // 默认调用 WebWorker 线程解析
        // 可配置 new Parser({ disableWorker: true }) 禁止
        const parser = new Parser()
        // #canvas 是 HTMLCanvasElement
        const player = new Player(el.current)
        
        ;(async () => {
          const fileData = await downloader.get(svgaDict[type])
          const svgaData = await parser.do(fileData)
          
        //   console.log(svgaData)
        
          player.set({ loop: 1 })
        
          await player.mount(svgaData)
        
          player
            // 开始动画事件回调
            .$on('start', () => {
                onStart()
            })
            // 暂停动画事件回调
            // .$on('pause', () => console.log('event pause'))
            // 停止动画事件回调
            // .$on('stop', () => console.log('event stop'))
            // 动画结束事件回调
            .$on('end', () => {
                onEnd()
                player.clear()
            })
            // 清空动画事件回调
            // .$on('clear', () => console.log('event clear'))
            // 动画播放中事件回调
            // .$on('process', () => console.log('event process', player.progress))
        
          // 开始播放动画
          player.start()
        
          // 暂停播放东湖
          // player.pause()
        
          // 停止播放动画
          // player.stop()
        
          // 清空动画
          // player.clear()
        })()
    }, [])
    const cls = classnames({
        [`svga-player`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps} style={{width: width ? width : 'auto', height: height ? height : 'auto'}}>
            <canvas ref={el} style={{width: width ? width : 'auto', height: height ? height : 'auto'}}>
            </canvas>
        </div>
    )
}