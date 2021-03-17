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
  /**
   * 媒体设备
   */
  // devices: Omit<MediaDeviceInfo, 'toJSON'>[];

  onClick: (itemType: string) => void;
  // /**
  //  * 点击结束课程，用户点击确认结束后的回调
  //  */
  // onEnd: () => void;
  // /**
  //  * 开始上课的回调
  //  */
  // onBegin: EventHandler<SyntheticEvent<HTMLButtonElement>>;
  // /**
  //  * 点击录制的回调
  //  */
  // onRecord: EventHandler<SyntheticEvent<HTMLElement>>;
  // /**
  //  * 点击退出的回调
  //  */
  // onExit: EventHandler<SyntheticEvent<HTMLElement>>;
  // /**
  //  * 切换设备的回调
  //  */
  // onDeviceChange: (device: Omit<MediaDeviceInfo, 'toJSON'>) => void;
}

export const BizHeader: FC<BizHeaderProps> = ({
  isStarted = false,
  signalQuality,
  title,
  monitor,
  onClick
}) => {
  const confirmExit = () => {
    Modal.show({
      showMask: true,
      onCancel: () => { onClick('cancel') },
      onOk: () => { onClick('ended') },
      width: 662,
      component: (
        <Modal
          footer={[
            <Button type="secondary" action="cancel">取消</Button>,
            <Button type="primary" action="ok">确认</Button>,
          ]}
          title="下课确认">
          <p>你确定要离开教室吗？</p>
        </Modal>
      )
    })
  }

  const handleClick = useCallback(() => {
    if (isStarted) {
      const confirmEnd = () => {
        Modal.show({
          showMask: true,
          onCancel: () => { onClick('cancel') },
          onOk: () => { onClick('ended') },
          width: 662,
          component: (
            <Modal
              footer={[
                <Button type="secondary" action="cancel">取消</Button>,
                <Button type="primary" action="ok">确认</Button>,
              ]}
              title="下课确认">
              <p>你确定要下课吗？</p>
            </Modal>
          )
        })
      }
      confirmEnd()
    } else {
      onClick('start')
    }
  }, [isStarted, onClick])

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
              onClick={handleClick}
            >
              {isStarted ? '下课' : '上课'}
            </Button>
          </div>
        </div>
        <div className="header-actions">
          <Icon type="record" size={24} onClick={() => onClick('record')} />
          <Icon type="set" size={24} />
          <Icon type="exit" size={24} onClick={() => confirmExit()} />
        </div>
      </Header>
      {/* modal api seems not reasonable */}
      {/* {modalVisible ? (
        <Modal
          onCancel={() => setModalVisible(false)}
          onOk={handleEndSession}
          
          footer={[
            <Button type="secondary" action="cancel">取消</Button>,
            <Button type="primary" action="ok">确认</Button>,
          ]}
          title="下课确认">
          <p>你确定要下课吗？</p>
        </Modal>
      ) : null} */}
    </>
  );
};
