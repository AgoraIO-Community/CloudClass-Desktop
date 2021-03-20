import React, { FC, useCallback } from 'react';
import { Button } from '~components/button';
import { Icon, IconTypes } from '~components/icon';
import { Header } from '~components/layout';
import { Popover } from '~components/popover';
import { SignalContent } from './signal-content';
import './index.css';
import { Modal } from '~components/modal';

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

export interface BizHeaderProps {
  /**
   * 课程是否开始
   */
  isStarted?: boolean;
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
  onClick: (itemType: string) => void;
}

export const BizHeader: FC<BizHeaderProps> = ({
  isStarted = false,
  signalQuality,
  title,
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
          <div>
            <Button
              type={isStarted ? 'danger' : 'primary'}
              onClick={() => onClick('courseControl')}
            >
              {isStarted ? '下课' : '上课'}
            </Button>
          </div>
        </div>
        <div className="header-actions">
          <Icon type="record" size={24} onClick={() => onClick('record')} />
          <Icon type="set" size={24} onClick={() => onClick('setting')}  />
          <Icon type="exit" size={24} onClick={() => onClick('exit')} />
        </div>
      </Header>
    </>
  );
};
