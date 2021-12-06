import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { Select } from '~components/select';
import { Slider } from '~components/slider';
import './index.css';
import { t, transI18n } from '~components/i18n';
import { CheckBox } from '~ui-kit/components/table';
interface DeviceProps {
  value: string;
  label: string;
}

export interface SettingProps extends BaseProps {
  isMirror?: boolean; // 是否镜像
  cameraList?: DeviceProps[]; // 摄像头设备数组
  cameraId?: string; // 选中的摄像头Id
  microphoneList?: DeviceProps[]; // 麦克风设备数组
  microphoneId?: string; // 选中的麦克风Id
  speakerList?: DeviceProps[]; // 扬声器设备数组
  speakerId?: string; // 选中的扬声器Id
  hasMicrophoneVolume?: boolean; // 是否有麦克风音量slider
  microphoneVolume?: number; // 麦克风音量
  hasSpeakerVolume?: boolean; // 是否有扬声器音量slider
  speakerVolume?: number; // 扬声器音量
  isNative?: boolean; // 是否原生
  isBeauty?: boolean;
  whitening?: number;
  buffing?: number;
  ruddy?: number;
  onChangeDevice?: (
    deviceType: 'camera' | 'microphone' | 'speaker',
    value: string,
  ) => void | Promise<void>;
  onChangeAudioVolume?: (deviceType: 'microphone' | 'speaker', value: number) => void;
  onSelectBeauty?: (isBeauty: boolean) => void;
  onChangeBeauty?: (beautyType: string, value: number) => void;
  onSelectMirror?: (isMirror: boolean) => void;
}

export const Setting: FC<SettingProps> = ({
  cameraList = [],
  cameraId,
  microphoneList = [],
  microphoneId,
  speakerList = [],
  speakerId,
  hasMicrophoneVolume = true,
  microphoneVolume = 50,
  hasSpeakerVolume = true,
  speakerVolume = 50,
  isNative = true,
  isMirror = false,
  isBeauty = false,
  whitening = 70,
  buffing = 50,
  ruddy = 10,
  onChangeDevice = (deviceType, value) => {},
  onChangeAudioVolume = (deviceType, value) => {},
  onSelectBeauty = (isBeauty) => {},
  onChangeBeauty = (beautyType, value) => {},
  onSelectMirror = (isMirror) => {},
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`setting`]: 1,
    [`${className}`]: !!className,
  });
  const cameraOptions = cameraList.map((item) => ({
    label: item.label,
    value: item.value,
    i18n: false,
  }));
  const microphoneOptions = microphoneList.map((item) => ({
    label: item.label,
    value: item.value,
    i18n: false,
  }));
  const speakerOptions = speakerList.map((item) => ({
    label: item.label,
    value: item.value,
    i18n: false,
  }));
  return (
    <div className={cls} {...restProps} style={{ width: 318 }}>
      <div className="device-choose">
        <div
          className="device-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <div>{transI18n('device.camera')}</div>
          <div style={{ display: 'flex' }}>
            {isNative ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: 7,
                }}>
                <CheckBox
                  style={{ width: 12, height: 12 }}
                  checked={isBeauty}
                  onChange={(e: any) => {
                    onSelectBeauty(e.target.checked);
                  }}
                />
                <span className="beauty-desc" style={{ marginLeft: 5 }}>
                  {transI18n('media.beauty')}
                </span>
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}>
              <CheckBox
                style={{ width: 12, height: 12 }}
                checked={isMirror}
                onChange={(e: any) => {
                  onSelectMirror(e.target.checked);
                }}
              />
              <span className="beauty-desc" style={{ marginLeft: 5 }}>
                {transI18n('media.mirror')}
              </span>
            </div>
          </div>
        </div>
        <Select
          value={cameraId}
          onChange={async (value) => {
            await onChangeDevice('camera', value);
          }}
          options={cameraOptions}></Select>
        {isNative && isBeauty ? (
          <>
            <div className="beauty-value">
              <span className="beauty-text">{transI18n('media.whitening')}</span>
              <Slider
                min={0}
                max={100}
                defaultValue={whitening}
                step={1}
                onChange={async (value) => {
                  await onChangeBeauty('whitening', value);
                }}
                tooltipPosition={''}></Slider>
              <span className="beauty-show-number">+{whitening}</span>
            </div>
            <div className="beauty-value">
              <span className="beauty-text">{transI18n('media.buffing')}</span>
              <Slider
                min={0}
                max={100}
                defaultValue={buffing}
                step={1}
                onChange={async (value) => {
                  await onChangeBeauty('buffing', value);
                }}
                tooltipPosition={''}></Slider>
              <span className="beauty-show-number">+{buffing}</span>
            </div>
            <div className="beauty-value">
              <span className="beauty-text">{transI18n('media.ruddy')}</span>
              <Slider
                min={0}
                max={100}
                defaultValue={ruddy}
                step={1}
                onChange={async (value) => {
                  await onChangeBeauty('ruddy', value);
                }}
                tooltipPosition={''}></Slider>
              <span className="beauty-show-number">+{ruddy}</span>
            </div>
          </>
        ) : null}
      </div>
      <div className="device-choose">
        <div className="device-title">{transI18n('device.microphone')}</div>
        <Select
          value={microphoneId}
          onChange={async (value) => {
            await onChangeDevice('microphone', value);
          }}
          options={microphoneOptions}></Select>
        {isNative ? (
          <div className="device-volume">
            <span className="device-text">{transI18n('device.microphone_volume')}</span>
            <Slider
              min={0}
              max={100}
              defaultValue={microphoneVolume}
              step={1}
              onChange={async (value) => {
                await onChangeAudioVolume('microphone', value);
              }}></Slider>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="device-choose">
        <div className="device-title">{transI18n('device.speaker')}</div>
        <Select
          value={speakerId}
          onChange={async (value) => {
            await onChangeDevice('speaker', value);
          }}
          options={speakerOptions}></Select>
        {isNative ? (
          <div className="device-volume">
            <span className="device-text">{transI18n('device.speaker_volume')}</span>
            <Slider
              min={0}
              max={100}
              defaultValue={speakerVolume}
              step={1}
              onChange={async (value) => {
                await onChangeAudioVolume('speaker', value);
              }}></Slider>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};
