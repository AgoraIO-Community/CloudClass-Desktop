import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select'
import { Slider } from '~components/slider'
import './index.css';

const { Option } = Select

interface DeviceProps {
    deviceId: string;
    label: string;
}

export interface SettingProps extends BaseProps {
    cameraList?: DeviceProps[]; // 摄像头设备数组
    cameraId?: string; // 选中的摄像头Id
    microphoneList?: DeviceProps[]; // 麦克风设备数组
    micorophoneId?: string; // 选中的麦克风Id
    speakerList?: DeviceProps[]; // 扬声器设备数组
    speakerId?: string; // 选中的扬声器Id
    hasMicrophoneVolume?: boolean; // 是否有麦克风音量slider
    microphoneVolume?: number; // 麦克风音量
    hasSpeakerVolume?: boolean; // 是否有扬声器音量slider
    speakerVolume?: number; // 扬声器音量
    onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onChangeAudioVolume?: (deviceType: string, value: number) => void;
}

export const Setting: FC<SettingProps> = ({
    cameraList = [],
    cameraId,
    microphoneList = [],
    micorophoneId,
    speakerList = [],
    speakerId,
    hasMicrophoneVolume = true,
    microphoneVolume = 50,
    hasSpeakerVolume = true,
    speakerVolume = 50,
    onChangeDevice = (deviceType, value) => {},
    onChangeAudioVolume = (deviceType, value) => {},
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`setting`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <div className="device-choose">
                <div className="device-title">摄像头</div>
                <Select 
                    defaultValue={cameraId}
                    onChange={async value => {
                        await onChangeDevice('camera', value)
                    }}
                >
                    {cameraList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
            </div>
            <div className="device-choose">
                <div className="device-title">麦克风</div>
                <Select 
                    defaultValue={micorophoneId}
                    onChange={async value => {
                        await onChangeDevice('microphone', value)
                    }}
                >
                    {microphoneList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
                {
                hasMicrophoneVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">音量</span>
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
                <div className="device-title">扬声器</div>
                <Select
                    defaultValue={speakerId}
                    onChange={async value => {
                        await onChangeDevice('speaker', value)
                    }}
                >
                    {speakerList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
                {
                    hasSpeakerVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">音量</span>
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
