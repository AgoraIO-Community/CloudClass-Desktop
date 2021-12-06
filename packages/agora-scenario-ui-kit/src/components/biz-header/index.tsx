import React, { FC } from 'react';
import { transI18n } from '../i18n';
import './index.css';
import { SvgImg, Header, Tooltip } from '../../components';
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
  /**
   * 音视频下行丢包率， 单位：%
   */
  rxPacketLossRate: number;
  /**
   * 音视频上行丢包率， 单位：%
   */
  txPacketLossRate: number;
  /**
   * 下行网路质量
   */
  rxNetworkQuality: string;
  /**
   * 上行网路质量
   */
  txNetworkQuality: string;
}

export type BizClassStatus = 'pre-class' | 'in-class' | 'end-class';

export interface BizHeaderProps {
  /**
   * 课程是否正在录制
   */
  isRecording: boolean;
  /**
   * 课程 title
   */
  title: string;

  onClick: (itemType: string) => void;

  userType?: 'teacher' | 'student';

  ClassStatusComponent: any;
  SignalQualityComponent: any;
}

export const BizHeader: FC<BizHeaderProps> = ({
  isRecording = false,
  title,
  userType = 'student',
  onClick,
  ClassStatusComponent = () => <div></div>,
  SignalQualityComponent = () => <div></div>,
}) => {
  return (
    <>
      <Header className="biz-header">
        <div>
          <SignalQualityComponent />
        </div>
        <div className="biz-header-title-wrap">
          <div className="biz-header-title">{title}</div>
          <div className="biz-header-title biz-subtitle">
            <ClassStatusComponent />
          </div>
        </div>
        <div className="header-actions">
          {userType === 'teacher' ? (
            <Tooltip
              title={
                isRecording
                  ? transI18n('biz-header.recording')
                  : transI18n('biz-header.start_record')
              }
              placement="bottom">
              <SvgImg
                canHover
                type={isRecording ? 'recording' : 'record'}
                style={{
                  color: isRecording ? '#2962F4' : undefined,
                }}
                size={24}
                onClick={() => onClick('record')}
              />
            </Tooltip>
          ) : null}
          <Tooltip title={transI18n('biz-header.perf')} placement="bottom">
            <SvgImg canHover type="more" size={24} onClick={() => onClick('perf')} />
          </Tooltip>
          <Tooltip title={transI18n('biz-header.setting')} placement="bottom">
            <SvgImg canHover type="set" size={24} onClick={() => onClick('setting')} />
          </Tooltip>
          <Tooltip title={transI18n('biz-header.exit')} placement="bottom">
            <SvgImg canHover type="exit" size={24} onClick={() => onClick('exit')} />
          </Tooltip>
        </div>
      </Header>
    </>
  );
};
