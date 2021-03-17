import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select'
import { Slider } from '~components/slider'
import { Icon } from '~components/icon'
import { Volume } from '~components/volume'
import { CheckBox } from '~components/table'
import { Button } from '~components/button';
import { VideoPlayer } from '~components/video-player'
import './index.css';

const { Option } = Select

interface DeviceProps {
    deviceId: string;
    label: string;
}

export interface PretestProps extends BaseProps {
    cameraArray?: DeviceProps[]; // 摄像头设备数组
    microphoneArray?: DeviceProps[]; // 麦克风设备数组
    speakerArray?: DeviceProps[]; // 扬声器设备数组
    isNative?: boolean; // web平台没有扬声器下拉
    cameraError?: boolean; // 展示摄像头错误信息
    microphoneError?: boolean; // 展示麦克风错误信息
}

export const Pretest: FC<PretestProps> = ({
    cameraArray = [],
    microphoneArray = [],
    speakerArray = [],
    isNative = true,
    cameraError = false,
    microphoneError = false,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`pretest`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <div className="pretest-left">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">摄像头</span>
                        <span>
                            <CheckBox style={{width: 12, height: 12}}/> <span className="camera-mode">镜像模式</span>
                        </span>
                    </div>
                    <Select defaultValue={cameraArray[0].deviceId}>
                        {cameraArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                    </Select>
                    <VideoPlayer/>
                </div>
            </div>
            <div className="pretest-right">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">麦克风</span>
                    </div>
                    <Select defaultValue={microphoneArray[0].deviceId}>
                        {microphoneArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                    </Select>
                    <div className="device-volume">
                        <span className="device-text">音量</span>
                        <Slider
                            min={0}
                            max={100}
                            defaultValue={50}
                            step={1}
                        ></Slider>
                    </div>
                    <div className="device-volume-test">
                        <Icon type="microphone-on-outline" color="#0073FF"/>
                        <Volume
                            currentVolumn={30}
                            maxLength={48}
                            style={{marginLeft: 6}}
                        />
                    </div>
                </div>
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">扬声器</span>
                    </div>
                    {isNative ? (
                        <Select defaultValue={speakerArray[0].deviceId}>
                            {speakerArray.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                        </Select>
                    ) : ""}
                    <div className="device-volume">
                        <span className="device-text">音量</span>
                        <Slider
                            min={0}
                            max={100}
                            defaultValue={50}
                            step={1}
                        ></Slider>
                    </div>
                    <div className="device-volume-test">
                        <Icon type="speaker" color="#0073FF"/>
                        <Volume
                            currentVolumn={10}
                            maxLength={33}
                            style={{marginLeft: 6}}
                        />
                        <Button type="secondary" style={{marginLeft: 10}}>扬声器检测</Button>
                    </div>
                </div>
                <div className="pretest-error-info">
                    {cameraError ? (
                        <div className="error-info">
                            <Icon type="camera-off" color="#BDBDCA"/>
                            <span className="error-info-desc">摄像头被拔出或摄像头已占用，无法显示视频！</span>
                        </div>
                    ) : ""}
                    {microphoneError ? (
                        <div className="error-info">
                            <Icon type="microphone-off-outline" color="#BDBDCA"/>
                            <span className="error-info-desc">麦克风被拔出或麦克风被占用，无法使用麦克风！</span>
                        </div>
                    ) : ""}
                </div>
            </div>
        </div>
    )
}