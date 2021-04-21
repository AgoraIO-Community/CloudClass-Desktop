import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select'
import { Slider } from '~components/slider'
import './index.css';
import { t } from '~components/i18n';
interface DeviceProps {
    deviceId: string;
    label: string;
}

export interface SettingProps extends BaseProps {
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
    onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onChangeAudioVolume?: (deviceType: string, value: number) => void;
    onSelectDevice?: (deviceType: string, value: string) => void | Promise<void>;
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
    onChangeDevice = (deviceType, value) => {},
    onChangeAudioVolume = (deviceType, value) => {},
    onSelectDevice = (deviceType, value) => {},
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`setting`]: 1,
        [`${className}`]: !!className,
    });
    const cameraOptions = cameraList.map(item => ({label: item.label, value: item.deviceId}))
    const microphoneOptions = microphoneList.map(item => ({label: item.label, value: item.deviceId}))
    const speakerOptions = speakerList.map(item => ({label: item.label, value: item.deviceId}))
    return (
        <div className={cls} {...restProps} style={{width: 318}}>
            <div className="device-choose">
                <div className="device-title">{t('device.camera')}</div>
                <Select 
                    value={cameraId}
                    onChange={async value => {
                        await onChangeDevice('camera', value)
                    }}
                    options={cameraOptions}
                >
                </Select>
            </div>
            <div className="device-choose">
                <div className="device-title">{t('device.microphone')}</div>
                <Select 
                    value={microphoneId}
                    onChange={async value => {
                        await onChangeDevice('microphone', value)
                    }}
                    options={microphoneOptions}
                >
                    
                </Select>
                {
                hasMicrophoneVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">{t('device.microphone_volume')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={microphoneVolume}
                                step={1}
                                onChange={async value => {
                                    await onChangeAudioVolume('microphone', value)
                                }}
                            ></Slider>
                        </div>
                    ) 
                    : ""
                }

            </div>
            <div className="device-choose">
                <div className="device-title">{t('device.speaker')}</div>
                <Select
                    value={speakerId}
                    onChange={async value => {
                        await onChangeDevice('speaker', value)
                    }}
                    options={speakerOptions}
                >
                </Select>
                {
                    hasSpeakerVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">{t('device.speaker_volume')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={speakerVolume}
                                step={1}
                                onChange={async value => {
                                    await onChangeAudioVolume('speaker', value)
                                }}
                            ></Slider>
                        </div>
                    ) 
                    : ""
                }

            </div>
        </div>
    )
}
