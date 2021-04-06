import React, { FC } from 'react';
import { Button } from '~components/button';
import { Icon, IconTypes } from '~components/icon';
import { Header } from '~components/layout';
import { Popover } from '~components/popover';
import { SignalContent } from './signal-content';
import './index.css';
import { Inline } from '~components';

const SIGNAL_QUALITY_ICONS: { [key: string]: string } = {
  excellent: 'good-signal',
  good: 'normal-signal',
  bad: 'bad-signal',
  unknown: 'unknown-signal',
};

export interface MonitorInfo {
  /**
   * CPU 使用率, 单位: %
   */
  cpuUsage: number;
  /**
   * 网络延迟, 单位: ms
   */
  networkLatency: number;
  /**
   * 网络状态
   */
  networkQuality: string;
  /**
   * 丢包率, 单位: %
   */
  packetLostRate: number;
}

export type BizClassStatus = 'pre-class' | 'in-class' | 'end-class';

export interface BizHeaderProps {
  /**
   * 课程是否开始
   */
  isStarted?: boolean;
  /**
   * 课程是否正在录制
   */
  isRecording: boolean
  /**
   * 课程 title
   */
  title: string;
  /**
   * 信号强度
   */
  signalQuality: 'excellent' | 'good' | 'bad' | 'unknown';
  /**
   * 系统相关信息
   */
  monitor: MonitorInfo;

  /**
   * 课程状态
   */
  classStatusText: string;

  /**
   * 
   */
  onClick: (itemType: string) => void;
}

export const BizHeader: FC<BizHeaderProps> = ({
  isStarted = false,
  isRecording = false,
  signalQuality,
  title,
  classStatusText,
  monitor,
  onClick
}) => {

  return (
    <>
      <Header className="biz-header">
        <Popover
          content={<SignalContent {...monitor} />}
          placement="bottomLeft">
          <div className={`biz-signal-quality ${signalQuality}`}>
            <Icon
              className="cursor-pointer"
              type={SIGNAL_QUALITY_ICONS[signalQuality] as IconTypes}
              size={24}
            />
          </div>
        </Popover>
        <div className="biz-header-title-wrap">
          <div className="biz-header-title">{title}</div>
          <div className="biz-header-title biz-subtitle">
            <Inline color="#677386">{classStatusText}</Inline>
            {/* <Inline color="#677386">{formatTime}</Inline> */}
          </div>
        </div>
        <div className="header-actions">
          {/* TODO recording icon replacement */}
          <Icon type={isRecording ? "recording" : "record"} color={isRecording?'#2962F4':undefined} size={24} onClick={() => onClick('record')} />
          <Icon type="set" size={24} onClick={() => onClick('setting')}  />
          <Icon type="exit" size={24} onClick={() => onClick('exit')} />
        </div>
      </Header>
    </>
  );
};
