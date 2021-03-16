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
    cameraArray?: DeviceProps[]; // 摄像头设备数组
    microphoneArray?: DeviceProps[]; // 麦克风设备数组
    speakerArray?: DeviceProps[]; // 扬声器设备数组
    hasMicrophoneVolume?: boolean; // 是否有麦克风音量slider
    hasSpeakerVolume?: boolean; // 是否有扬声器音量slider
}

export const Setting: FC<SettingProps> = ({
    cameraArray = [],
    microphoneArray = [],
    speakerArray = [],
    hasMicrophoneVolume = true,
    hasSpeakerVolume = true,
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
                <Select defaultValue={cameraArray[0].deviceId}>
                    {cameraArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
            </div>
            <div className="device-choose">
                <div className="device-title">麦克风</div>
                <Select defaultValue={microphoneArray[0].deviceId}>
                    {microphoneArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
                {
                hasMicrophoneVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">音量</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={50}
                                step={1}
                            ></Slider>
                        </div>
                    ) 
                    : ""
                }

            </div>
            <div className="device-choose">
                <div className="device-title">扬声器</div>
                <Select defaultValue={speakerArray[0].deviceId}>
                    {speakerArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                </Select>
                {
                    hasSpeakerVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">音量</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={50}
                                step={1}
                            ></Slider>
                        </div>
                    ) 
                    : ""
                }

            </div>
        </div>
    )
}
