import React, { FC } from 'react';
import { Button } from '~components/button';
import { Icon, IconTypes } from '~components/icon';
import { Header } from '~components/layout';
import { Popover } from '~components/popover';
import { SignalContent } from './signal-content';
import './index.css';
import { Inline } from '~components';
import penConnected from './assets/pen-connected.svg';
import logout from './assets/logout.png'
import zoomout from './assets/zoomout.svg'
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { useTranslation } from 'react-i18next';

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
   * 是否是原生
   */
  isNative: boolean;
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
  * 角色
  */
  isRole: EduRoleTypeEnum;

  /**
   * 课程状态
   */
  classStatusText: string;

  /**
   * 当前直播间学生人数
   */
  currentStudents: Number;

  /**
   * 直播间应存在的总人数
   */
  totalStudents: Number;

  /**
   * click
   */
  onClick: (itemType: string) => void;
}

export const BizHeader: FC<BizHeaderProps> = ({
  isStarted = false,
  isRecording = false,
  isNative = false,
  signalQuality,
  title,
  isRole,
  classStatusText,
  currentStudents = 0,
  totalStudents = 0,
  monitor,
  onClick
}) => {

  const {t} = useTranslation()
  
  return (
    <>
      <Header className="biz-header">
        <div className="biz-header-title-wrap">
          <div className="biz-header-title">{title}</div>
        </div>
        <div className='right-content-wrapper'>
          <div className='biz-header-right-content-row'>
            <div className='biz-header-col'>
              <div className='student-count'>学员人数<span>{currentStudents} </span>/ {totalStudents}</div>
            </div>
            <div className='biz-header-col'>
              <div className={`biz-signal-quality ${signalQuality}`}>
              </div> 
              <div className={`biz-header-col-networkLatency ${signalQuality}`}>
                {monitor.networkLatency}ms
              </div>
              <div className='biz-header-col-networkQuality'>
                {t(`${monitor.networkQuality}`)}
              </div>
            </div>
          </div>
          <div className="header-actions">
          {isRole === EduRoleTypeEnum.student ? 
          (
            <>
            <div className='pen-action'>
              <img src={penConnected} alt="" />
              <div className='pen-status'>我的智能笔<span>已连接</span></div>
            </div>
            <div className='zoomout' onClick={() => onClick('fullScreen')}>
              <img src={ zoomout } alt="" />
              {isRole === EduRoleTypeEnum.student ? '全屏学习' : null}
            </div>
            </>
          )
          : isRole === EduRoleTypeEnum.teacher ? 
          (<div className='zoomout' onClick={() => onClick('fullScreen')}>
              <img src={ zoomout } alt="" />
              {isRole === EduRoleTypeEnum.teacher ? '全屏授课' : null}
            </div>) : null
          }
            <div className='logout' onClick={() => onClick('exit')}>
              <img src={ logout } alt="" />
              退出
            </div>
          </div>
        </div>
      </Header>
    </>
  );
};

